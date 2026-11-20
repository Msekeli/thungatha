import "server-only";
import type { AiCompletionRequest, AiCompletionResult, AiProviderAdapter } from "../contracts";
import { AiProviderError } from "../errors";

const ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";
const responseSchema = (value: unknown) => {
  if (!value || typeof value !== "object") return null;
  const candidates = (value as { candidates?: unknown[] }).candidates;
  const first = candidates?.[0] as { content?: { parts?: { text?: unknown }[] }; finishReason?: string } | undefined;
  const content = first?.content?.parts?.map((part) => typeof part.text === "string" ? part.text : "").join("");
  return content ? { content, finishReason: first?.finishReason } : null;
};

export function createGeminiAdapter(options: { apiKey?: string; model?: string; fetcher?: typeof fetch } = {}): AiProviderAdapter {
  const fetcher = options.fetcher ?? fetch;
  return {
    provider: "gemini",
    async complete(request: AiCompletionRequest): Promise<AiCompletionResult> {
      const apiKey = options.apiKey ?? process.env.GEMINI_API_KEY;
      const model = options.model ?? process.env.GEMINI_MODEL;
      if (!apiKey || !model) throw new AiProviderError("Gemini credentials or model are not configured.", { code: "configuration", provider: "gemini" });
      let response: Response;
      try {
        response = await fetcher(`${ENDPOINT}/${encodeURIComponent(model)}:generateContent`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
          signal: AbortSignal.timeout(request.timeoutMs ?? 90_000),
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: request.systemPrompt }] },
            contents: [{ role: "user", parts: [{ text: request.userPrompt }] }],
            generationConfig: {
              ...(request.responseFormat === "json" ? { responseMimeType: "application/json" } : {}),
              ...(request.temperature !== undefined ? { temperature: request.temperature } : {}),
              ...(request.maxOutputTokens ? { maxOutputTokens: request.maxOutputTokens } : {}),
            },
          }),
        });
      } catch (cause) {
        const timeout = cause instanceof Error && cause.name === "TimeoutError";
        throw new AiProviderError(timeout ? "Gemini request timed out." : "Gemini is unavailable.", {
          code: timeout ? "timeout" : "unavailable", provider: "gemini", retryable: true, cause,
        });
      }
      if (!response.ok) throw new AiProviderError(`Gemini returned HTTP ${response.status}.`, {
        code: response.status === 429 ? "rate-limited" : response.status === 401 || response.status === 403 ? "authentication" : response.status >= 500 ? "unavailable" : "unknown",
        provider: "gemini", retryable: response.status === 429 || response.status >= 500,
      });
      const payload = await response.json().catch(() => null);
      const parsed = responseSchema(payload);
      if (!parsed) throw new AiProviderError("Gemini returned no usable candidate content.", { code: "invalid-response", provider: "gemini" });
      const usage = (payload as { usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number } })?.usageMetadata;
      return { ...parsed, provider: "gemini", model, usage: { inputTokens: usage?.promptTokenCount, outputTokens: usage?.candidatesTokenCount } };
    },
  };
}
