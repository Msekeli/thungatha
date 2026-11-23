import { describe, expect, it, vi } from "vitest";
import { createGroqAdapter } from "@/lib/ai/providers/groq-adapter";

describe("Groq adapter", () => {
  it("sends dynamic evidence enums through strict JSON Schema structured outputs", async () => {
    const responseSchema = {
      type: "OBJECT",
      properties: {
        evidenceRefs: { type: "ARRAY", items: { type: "STRING", enum: ["profile:skills[0].name"] } },
        assessment: { type: "STRING", enum: ["supported", "not_demonstrated"] },
      },
    };
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify({
      model: "openai/gpt-oss-120b",
      choices: [{ message: { content: '{"evidenceRefs":["profile:skills[0].name"],"assessment":"supported"}' }, finish_reason: "stop" }],
      usage: { prompt_tokens: 20, completion_tokens: 5 },
    }), { status: 200 }));

    await createGroqAdapter({ apiKey: "test-key", model: "openai/gpt-oss-120b", fetcher }).complete({
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
            evidenceRefs: { type: "array", items: { type: "string", enum: ["profile:skills[0].name"] } },
            assessment: { type: "string", enum: ["supported", "not_demonstrated"] },
          },
        },
      },
    });
  });

  it("uses JSON object mode when no schema is supplied", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify({
      choices: [{ message: { content: '{"ok":true}' } }],
    }), { status: 200 }));

    await createGroqAdapter({ apiKey: "test-key", model: "test-model", fetcher }).complete({
      task: "job-requirement-extraction",
      systemPrompt: "Return JSON.",
      userPrompt: "Run.",
      responseFormat: "json",
    });

    const [, init] = fetcher.mock.calls[0] ?? [];
    expect(JSON.parse(String(init?.body)).response_format).toEqual({ type: "json_object" });
  });
});
