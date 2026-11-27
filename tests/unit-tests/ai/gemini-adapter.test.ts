import { describe, expect, it, vi } from "vitest";
import { createGeminiAdapter } from "@/lib/ai/providers/gemini-adapter";
import { AiProviderError } from "@/lib/ai/errors";

describe("Gemini adapter", () => {
  it("sends structured output schemas and returns finish reason and token usage", async () => {
    const responseSchema = {
      type: "OBJECT",
      properties: { value: { type: "STRING" } },
      required: ["value"],
    };
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          candidates: [
            {
              content: { parts: [{ text: '{"value":"ok"}' }] },
              finishReason: "STOP",
            },
          ],
          usageMetadata: { promptTokenCount: 20, candidatesTokenCount: 5 },
        }),
        { status: 200 },
      ),
    );

    const result = await createGeminiAdapter({
      apiKey: "test-key",
      model: "test-model",
      fetcher,
    }).complete({
      task: "job-requirement-extraction",
      systemPrompt: "Return JSON.",
      userPrompt: "Extract.",
      responseFormat: "json",
      responseSchema,
      maxOutputTokens: 100,
    });

    const [, init] = fetcher.mock.calls[0] ?? [];
    const body = JSON.parse(String(init?.body));
    expect(body.generationConfig).toMatchObject({
      responseMimeType: "application/json",
      responseSchema,
      maxOutputTokens: 100,
    });
    expect(result).toMatchObject({
      content: '{"value":"ok"}',
      finishReason: "STOP",
      usage: { inputTokens: 20, outputTokens: 5 },
    });
  });

  it("preserves HTTP status, provider detail, and Retry-After", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          error: { message: "The service is temporarily overloaded." },
        }),
        {
          status: 503,
          headers: { "content-type": "application/json", "retry-after": "1" },
        },
      ),
    );

    await expect(
      createGeminiAdapter({
        apiKey: "test-key",
        model: "test-model",
        fetcher,
      }).complete({
        task: "job-requirement-extraction",
        systemPrompt: "Return JSON.",
        userPrompt: "Extract.",
        responseFormat: "json",
      }),
    ).rejects.toMatchObject({
      name: "AiProviderError",
      code: "unavailable",
      retryable: true,
      retryAfterMs: 1_000,
      message:
        "Gemini returned HTTP 503. The service is temporarily overloaded.",
    } satisfies Partial<AiProviderError>);
  });
});
