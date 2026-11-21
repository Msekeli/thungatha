import "server-only";
import type { AiCompletionRequest, AiCompletionResult, AiProviderAdapter } from "../contracts";
import { AiProviderError, createProviderHttpError } from "../errors";

const ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

export function createGroqAdapter(options: { apiKey?: string; model?: string; fetcher?: typeof fetch } = {}): AiProviderAdapter {
  const fetcher = options.fetcher ?? fetch;
  return {
    provider: "groq",
    async complete(request: AiCompletionRequest): Promise<AiCompletionResult> {
      const apiKey = options.apiKey ?? process.env.GROQ_API_KEY;
      const model = options.model ?? process.env.GROQ_MODEL;
      if (!apiKey || !model) throw new AiProviderError("Groq credentials or model are not configured.", { code: "configuration", provider: "groq" });
      let response: Response;
      try {
        response = await fetcher(ENDPOINT, {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
          signal: AbortSignal.timeout(request.timeoutMs ?? 90_000),
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: request.systemPrompt },
              { role: "user", content: request.userPrompt },
            ],
            ...(request.responseFormat === "json" ? { response_format: { type: "json_object" } } : {}),
            ...(request.temperature !== undefined ? { temperature: request.temperature } : {}),
            ...(request.maxOutputTokens ? { max_tokens: request.maxOutputTokens } : {}),
          }),
        });
      } catch (cause) {
        const timeout = cause instanceof Error && cause.name === "TimeoutError";
        throw new AiProviderError(timeout ? "Groq request timed out." : "Groq is unavailable.", {
          code: timeout ? "timeout" : "unavailable", provider: "groq", retryable: true, cause,
        });
      }
      if (!response.ok) {
        const errorPayload = await response.json().catch(() => null);
        throw createProviderHttpError("groq", response.status, response.headers.get("retry-after"), errorPayload);
      }
      const payload = await response.json().catch(() => null) as {
        model?: string; choices?: { message?: { content?: unknown }; finish_reason?: string }[];
        usage?: { prompt_tokens?: number; completion_tokens?: number };
      } | null;
      const content = payload?.choices?.[0]?.message?.content;
      if (typeof content !== "string" || !content) throw new AiProviderError("Groq returned no usable completion content.", { code: "invalid-response", provider: "groq" });
      return {
        content, provider: "groq", model: payload?.model ?? model,
        finishReason: payload?.choices?.[0]?.finish_reason,
        usage: { inputTokens: payload?.usage?.prompt_tokens, outputTokens: payload?.usage?.completion_tokens },
      };
    },
  };
}
