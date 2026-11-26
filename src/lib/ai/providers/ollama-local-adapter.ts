import "server-only";
import type {
  AiCompletionRequest,
  AiCompletionResult,
  AiProviderAdapter,
} from "../contracts";
import { AiProviderError } from "../errors";
import { ollamaHttpError, readOllamaResponse } from "./ollama-local-protocol";

const DEFAULT_BASE_URL = "http://127.0.0.1:11434";
const DEFAULT_TIMEOUT_MS = 90_000;

export interface OllamaLocalAdapterOptions {
  baseUrl?: string;
  model?: string;
  fetcher?: typeof fetch;
}

export function createOllamaLocalAdapter(
  options: OllamaLocalAdapterOptions = {},
): AiProviderAdapter {
  const fetcher = options.fetcher ?? fetch;
  return {
    provider: "ollama-local",
    async complete(request: AiCompletionRequest): Promise<AiCompletionResult> {
      const model = options.model ?? process.env.OLLAMA_LOCAL_MODEL;
      if (!model)
        throw new AiProviderError("OLLAMA_LOCAL_MODEL is not configured.", {
          code: "configuration",
          provider: "ollama-local",
        });
      const baseUrl = (
        options.baseUrl ??
        process.env.OLLAMA_LOCAL_BASE_URL ??
        DEFAULT_BASE_URL
      ).replace(/\/+$/, "");
      let response: Response;
      try {
        response = await fetcher(`${baseUrl}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: AbortSignal.timeout(request.timeoutMs ?? DEFAULT_TIMEOUT_MS),
          body: JSON.stringify({
            model,
            ...(request.reasoning !== undefined
              ? { think: request.reasoning }
              : {}),
            messages: [
              { role: "system", content: request.systemPrompt },
              { role: "user", content: request.userPrompt },
            ],
            stream: false,
            format: request.responseFormat === "json" ? "json" : undefined,
            options: {
              temperature: request.temperature,
              num_predict: request.maxOutputTokens,
            },
          }),
        });
      } catch (cause) {
        const timedOut =
          cause instanceof Error && cause.name === "TimeoutError";
        throw new AiProviderError(
          timedOut ? "Ollama request timed out." : "Ollama is unavailable.",
          {
            code: timedOut ? "timeout" : "unavailable",
            provider: "ollama-local",
            retryable: true,
            cause,
          },
        );
      }
      if (!response.ok)
        throw ollamaHttpError(
          response.status,
          response.headers.get("retry-after"),
        );
      return readOllamaResponse(response);
    },
  };
}
