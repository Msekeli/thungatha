import type { AiCompletionRequest } from "../contracts";
import { AiProviderError } from "../errors";

export function getGroqCompletionTokenBudget(
  request: AiCompletionRequest,
): number | undefined {
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
  const estimatedInputTokens = Math.ceil(requestCharacters / 3);
  const safetyReserve = 500;
  const availableCompletionTokens = Math.floor(
    tpmLimit - estimatedInputTokens - safetyReserve,
  );

  if (availableCompletionTokens < 512) {
    throw new AiProviderError(
      `Groq request for task "${request.task}" exceeds the configured ${tpmLimit} TPM budget before completion; estimated prompt usage is ${estimatedInputTokens} tokens (system: ${request.systemPrompt.length} chars, user: ${request.userPrompt.length} chars, schema: ${schemaCharacters} chars; requested output: ${request.maxOutputTokens ?? "provider default"} tokens).`,
      { code: "configuration", provider: "groq", retryable: false },
    );
  }
  return request.maxOutputTokens
    ? Math.min(request.maxOutputTokens, availableCompletionTokens)
    : undefined;
}
