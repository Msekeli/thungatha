import type { AiCompletionResult } from "../contracts";
import { AiProviderError, createProviderHttpError } from "../errors";

export async function parseGroqResponse(
  response: Response,
  model: string,
): Promise<AiCompletionResult> {
  if (!response.ok) {
    const errorPayload = await response.json().catch(() => null);
    throw createProviderHttpError(
      "groq",
      response.status,
      response.headers.get("retry-after"),
      errorPayload,
    );
  }

  const payload = (await response.json().catch(() => null)) as {
    model?: string;
    choices?: { message?: { content?: unknown }; finish_reason?: string }[];
    usage?: { prompt_tokens?: number; completion_tokens?: number };
  } | null;
  const finishReason = payload?.choices?.[0]?.finish_reason;
  if (finishReason?.toUpperCase() === "LENGTH") {
    throw new AiProviderError(
      "Groq truncated the structured response at its completion-token limit.",
      { code: "output-limit", provider: "groq", retryable: false },
    );
  }
  const content = payload?.choices?.[0]?.message?.content;
  if (typeof content !== "string" || !content) {
    throw new AiProviderError(
      "Groq returned no usable completion content.",
      { code: "invalid-response", provider: "groq" },
    );
  }
  return {
    content,
    provider: "groq",
    model: payload?.model ?? model,
    finishReason,
    usage: {
      inputTokens: payload?.usage?.prompt_tokens,
      outputTokens: payload?.usage?.completion_tokens,
    },
  };
}
