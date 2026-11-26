import "server-only";

import type {
  AiCompletionRequest,
  AiCompletionResult,
  AiProviderAdapter,
} from "../contracts";
import { AiProviderError } from "../errors";
import { toOpenAiJsonSchema } from "./groq-schema";
import { getGroqCompletionTokenBudget } from "./groq-token-budget";
import { parseGroqResponse } from "./groq-response";

const ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

export function createGroqAdapter(
  options: { apiKey?: string; model?: string; fetcher?: typeof fetch } = {},
): AiProviderAdapter {
  const fetcher = options.fetcher ?? fetch;
  return {
    provider: "groq",
    async complete(request: AiCompletionRequest): Promise<AiCompletionResult> {
      const apiKey = options.apiKey ?? process.env.GROQ_API_KEY;
      const model = options.model ?? process.env.GROQ_MODEL;
      if (!apiKey || !model) {
        throw new AiProviderError(
          "Groq credentials or model are not configured.",
          { code: "configuration", provider: "groq" },
        );
      }
      const completionTokenBudget = getGroqCompletionTokenBudget(request);
      let response: Response;
      try {
        response = await fetcher(ENDPOINT, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          signal: AbortSignal.timeout(request.timeoutMs ?? 90_000),
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: request.systemPrompt },
              { role: "user", content: request.userPrompt },
            ],
            ...(request.responseFormat === "json"
              ? request.responseSchema
                ? {
                    response_format: {
                      type: "json_schema",
                      json_schema: {
                        name: "thungatha_ai_response",
                        strict: true,
                        schema: toOpenAiJsonSchema(request.responseSchema),
                      },
                    },
                  }
                : { response_format: { type: "json_object" } }
              : {}),
            ...(request.temperature !== undefined
              ? { temperature: request.temperature }
              : {}),
            ...(completionTokenBudget
              ? { max_completion_tokens: completionTokenBudget }
              : {}),
          }),
        });
      } catch (cause) {
        const timeout = cause instanceof Error && cause.name === "TimeoutError";
        throw new AiProviderError(
          timeout ? "Groq request timed out." : "Groq is unavailable.",
          {
            code: timeout ? "timeout" : "unavailable",
            provider: "groq",
            retryable: true,
            cause,
          },
        );
      }
      return parseGroqResponse(response, model);
    },
  };
}
