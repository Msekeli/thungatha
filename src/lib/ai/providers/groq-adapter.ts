import "server-only";
import type {
  AiCompletionRequest,
  AiCompletionResult,
  AiProviderAdapter,
} from "../contracts";
import { AiProviderError, createProviderHttpError } from "../errors";

const ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

const JSON_SCHEMA_TYPES: Record<string, string> = {
  OBJECT: "object",
  ARRAY: "array",
  STRING: "string",
  NUMBER: "number",
  INTEGER: "integer",
  BOOLEAN: "boolean",
};

/** Convert the provider-neutral/Gemini schema representation into strict OpenAI JSON Schema. */
function toOpenAiJsonSchema(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const schema = value as Record<string, unknown>;
  const output: Record<string, unknown> = {};
  // Zod emits nullable fields as anyOf(string, null). Dropping anyOf leaves
  // an unconstrained property, which can make Groq strict structured output
  // reject or mis-handle otherwise valid responses.
  if (Array.isArray(schema.anyOf)) {
    output.anyOf = schema.anyOf.map(toOpenAiJsonSchema);
  }
  if (Array.isArray(schema.type)) {
    output.anyOf = schema.type.map((type) =>
      toOpenAiJsonSchema({ type }),
    );
  } else if (typeof schema.type === "string") {
    output.type = JSON_SCHEMA_TYPES[schema.type] ?? schema.type.toLowerCase();
  }
  if (Array.isArray(schema.enum)) output.enum = schema.enum;
  if (typeof schema.description === "string")
    output.description = schema.description;
  if (typeof schema.format === "string") output.format = schema.format;
  if (schema.items && typeof schema.items === "object")
    output.items = toOpenAiJsonSchema(schema.items);
  if (
    schema.properties &&
    typeof schema.properties === "object" &&
    !Array.isArray(schema.properties)
  ) {
    const properties = schema.properties as Record<string, unknown>;
    output.properties = Object.fromEntries(
      Object.entries(properties).map(([key, child]) => [
        key,
        toOpenAiJsonSchema(child),
      ]),
    );
    // Groq strict structured outputs require every property to be required.
    output.required = Object.keys(properties);
    output.additionalProperties = false;
  }
  return output;
}

export function createGroqAdapter(
  options: { apiKey?: string; model?: string; fetcher?: typeof fetch } = {},
): AiProviderAdapter {
  const fetcher = options.fetcher ?? fetch;
  return {
    provider: "groq",
    async complete(request: AiCompletionRequest): Promise<AiCompletionResult> {
      const apiKey = options.apiKey ?? process.env.GROQ_API_KEY;
      const model = options.model ?? process.env.GROQ_MODEL;
      if (!apiKey || !model)
        throw new AiProviderError(
          "Groq credentials or model are not configured.",
          { code: "configuration", provider: "groq" },
        );
      const configuredTpmLimit = Number(process.env.GROQ_TPM_LIMIT ?? 8_000);
      const tpmLimit =
        Number.isFinite(configuredTpmLimit) && configuredTpmLimit > 0
          ? configuredTpmLimit
          : 8_000;
      const schemaCharacters = request.responseSchema
        ? JSON.stringify(request.responseSchema).length
        : 0;
      const requestCharacters =
        request.systemPrompt.length +
        request.userPrompt.length +
        schemaCharacters;
      // Conservative estimate includes the structured-output schema and reserves
      // capacity for tokenizer variance and provider-side overhead.
      const estimatedInputTokens = Math.ceil(requestCharacters / 3);
      const safetyReserve = 500;
      const availableCompletionTokens = Math.floor(
        tpmLimit - estimatedInputTokens - safetyReserve,
      );
      if (request.maxOutputTokens && availableCompletionTokens < 512) {
        throw new AiProviderError(
          `Groq request exceeds the configured ${tpmLimit} TPM budget before completion; estimated prompt usage is ${estimatedInputTokens} tokens.`,
          { code: "configuration", provider: "groq", retryable: false },
        );
      }
      const completionTokenBudget = request.maxOutputTokens
        ? Math.min(request.maxOutputTokens, availableCompletionTokens)
        : undefined;
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
          {
            code: "invalid-response",
            provider: "groq",
            retryable: false,
          },
        );
      }
      const content = payload?.choices?.[0]?.message?.content;
      if (typeof content !== "string" || !content)
        throw new AiProviderError(
          "Groq returned no usable completion content.",
          { code: "invalid-response", provider: "groq" },
        );
      return {
        content,
        provider: "groq",
        model: payload?.model ?? model,
        finishReason: payload?.choices?.[0]?.finish_reason,
        usage: {
          inputTokens: payload?.usage?.prompt_tokens,
          outputTokens: payload?.usage?.completion_tokens,
        },
      };
    },
  };
}
