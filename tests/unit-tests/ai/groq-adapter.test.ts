import { describe, expect, it, vi } from "vitest";
import { createGroqAdapter } from "@/lib/ai/providers/groq-adapter";

describe("Groq adapter", () => {
  it("sends dynamic evidence enums through strict JSON Schema structured outputs", async () => {
    const responseSchema = {
      type: "OBJECT",
      properties: {
        evidenceRefs: {
          type: "ARRAY",
          items: { type: "STRING", enum: ["profile:skills[0].name"] },
        },
        assessment: { type: "STRING", enum: ["supported", "not_demonstrated"] },
      },
    };
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          model: "openai/gpt-oss-120b",
          choices: [
            {
              message: {
                content:
                  '{"evidenceRefs":["profile:skills[0].name"],"assessment":"supported"}',
              },
              finish_reason: "stop",
            },
          ],
          usage: { prompt_tokens: 20, completion_tokens: 5 },
        }),
        { status: 200 },
      ),
    );

    await createGroqAdapter({
      apiKey: "test-key",
      model: "openai/gpt-oss-120b",
      fetcher,
    }).complete({
      task: "job-requirement-extraction",
      systemPrompt: "Return JSON.",
      userPrompt: "Assess.",
      responseFormat: "json",
      responseSchema,
    });

    const [, init] = fetcher.mock.calls[0] ?? [];
    const body = JSON.parse(String(init?.body));
    expect(body.response_format).toMatchObject({
      type: "json_schema",
      json_schema: {
        name: "thungatha_ai_response",
        strict: true,
        schema: {
          type: "object",
          additionalProperties: false,
          required: ["evidenceRefs", "assessment"],
          properties: {
            evidenceRefs: {
              type: "array",
              items: { type: "string", enum: ["profile:skills[0].name"] },
            },
            assessment: {
              type: "string",
              enum: ["supported", "not_demonstrated"],
            },
          },
        },
      },
    });
  });

  it("preserves nullable fields when converting strict JSON Schema", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          choices: [
            {
              message: { content: '{"originalText":null}' },
              finish_reason: "stop",
            },
          ],
        }),
        { status: 200 },
      ),
    );

    await createGroqAdapter({
      apiKey: "test-key",
      model: "openai/gpt-oss-120b",
      fetcher,
    }).complete({
      task: "cv-tailoring",
      systemPrompt: "Return JSON.",
      userPrompt: "Tailor.",
      responseFormat: "json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          originalText: {
            anyOf: [{ type: "STRING" }, { type: "NULL" }],
          },
        },
      },
    });

    const [, init] = fetcher.mock.calls[0] ?? [];
    const body = JSON.parse(String(init?.body));
    expect(
      body.response_format.json_schema.schema.properties.originalText,
    ).toEqual({
      anyOf: [{ type: "string" }, { type: "null" }],
    });
  });

  it("treats Groq TPM admission failures as retryable capacity limits", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          error: {
            message:
              "Request too large on tokens per minute (TPM): Limit 8000, Requested 10253.",
          },
        }),
        { status: 413 },
      ),
    );
    const adapter = createGroqAdapter({
      apiKey: "test-key",
      model: "openai/gpt-oss-120b",
      fetcher,
    });

    await expect(
      adapter.complete({
        task: "job-fit-assessment",
        systemPrompt: "Return JSON.",
        userPrompt: "Assess.",
        responseFormat: "json",
      }),
    ).rejects.toMatchObject({
      code: "rate-limited",
      provider: "groq",
      retryable: true,
    });
  });

  it("does not treat unrelated HTTP 413 responses as retryable", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          error: { message: "Payload exceeds the maximum request size." },
        }),
        { status: 413 },
      ),
    );
    const adapter = createGroqAdapter({
      apiKey: "test-key",
      model: "openai/gpt-oss-120b",
      fetcher,
    });

    await expect(
      adapter.complete({
        task: "job-fit-assessment",
        systemPrompt: "Return JSON.",
        userPrompt: "Assess.",
        responseFormat: "json",
      }),
    ).rejects.toMatchObject({
      code: "unknown",
      provider: "groq",
      retryable: false,
    });
  });

  it("sends the requested completion-token budget to Groq", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          choices: [
            { message: { content: '{"ok":true}' }, finish_reason: "stop" },
          ],
        }),
        { status: 200 },
      ),
    );

    await createGroqAdapter({
      apiKey: "test-key",
      model: "openai/gpt-oss-120b",
      fetcher,
    }).complete({
      task: "job-requirement-extraction",
      systemPrompt: "Return JSON.",
      userPrompt: "Extract.",
      responseFormat: "json",
      maxOutputTokens: 4_096,
    });

    const [, init] = fetcher.mock.calls[0] ?? [];
    expect(JSON.parse(String(init?.body)).max_completion_tokens).toBe(4_096);
  });

  it("classifies Groq output truncation as a non-retryable output-limit failure", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          error: {
            message:
              "max completion tokens reached before generating a valid document: output was truncated",
          },
        }),
        { status: 400 },
      ),
    );
    const adapter = createGroqAdapter({
      apiKey: "test-key",
      model: "openai/gpt-oss-120b",
      fetcher,
    });

    await expect(
      adapter.complete({
        task: "job-requirement-extraction",
        systemPrompt: "Return JSON.",
        userPrompt: "Extract.",
        responseFormat: "json",
      }),
    ).rejects.toMatchObject({
      code: "output-limit",
      provider: "groq",
      retryable: false,
    });
  });

  it("uses JSON object mode when no schema is supplied", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          choices: [{ message: { content: '{"ok":true}' } }],
        }),
        { status: 200 },
      ),
    );

    await createGroqAdapter({
      apiKey: "test-key",
      model: "test-model",
      fetcher,
    }).complete({
      task: "job-requirement-extraction",
      systemPrompt: "Return JSON.",
      userPrompt: "Run.",
      responseFormat: "json",
    });

    const [, init] = fetcher.mock.calls[0] ?? [];
    expect(JSON.parse(String(init?.body)).response_format).toEqual({
      type: "json_object",
    });
  });
});
