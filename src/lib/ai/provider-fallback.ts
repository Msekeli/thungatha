import type { AiCompletionRequest, AiCompletionResult } from "./contracts";
import { AiProviderError } from "./errors";
import { getAiProviderAdapter } from "./provider-plan";
import { completeWithRetry } from "./provider-retry";
import type { SupportedProvider } from "./provider-config";

export async function completeWithFallbacks(
  primary: SupportedProvider,
  fallbacks: SupportedProvider[],
  request: AiCompletionRequest,
  primaryError: unknown,
): Promise<AiCompletionResult> {
  const fallbackFailures: string[] = [];
  const fallbackErrors: AiProviderError[] = [];

  for (const provider of fallbacks) {
    console.warn(
      "[AI provider] Primary provider unavailable; trying enabled fallback",
      {
        primary,
        fallback: provider,
        task: request.task,
        code:
          primaryError instanceof AiProviderError
            ? primaryError.code
            : "unknown",
      },
    );
    try {
      const result = await completeWithRetry(
        getAiProviderAdapter(provider),
        request,
      );
      console.info("[AI provider] Fallback provider completed task", {
        primary,
        provider: result.provider,
        model: result.model,
        task: request.task,
      });
      return result;
    } catch (fallbackError) {
      const detail =
        fallbackError instanceof Error
          ? fallbackError.message
          : "Unknown provider failure";
      fallbackFailures.push(`${provider}: ${detail}`);
      if (fallbackError instanceof AiProviderError) {
        fallbackErrors.push(fallbackError);
      }
      console.warn("[AI provider] Enabled fallback failed", {
        provider,
        task: request.task,
        code:
          fallbackError instanceof AiProviderError
            ? fallbackError.code
            : "unknown",
        error: detail.slice(0, 300),
      });
    }
  }

  const primaryDetail =
    primaryError instanceof Error
      ? primaryError.message
      : "Unknown primary provider failure";
  const providerErrors = [
    ...(primaryError instanceof AiProviderError ? [primaryError] : []),
    ...fallbackErrors,
  ];
  const retryableErrors = providerErrors.filter((error) => error.retryable);
  const retryAfterMs = retryableErrors.reduce(
    (maximum, error) => Math.max(maximum, error.retryAfterMs ?? 0),
    0,
  );
  const code = providerErrors.some((error) => error.code === "rate-limited")
    ? "rate-limited"
    : primaryError instanceof AiProviderError
      ? primaryError.code
      : "unavailable";

  throw new AiProviderError(
    `All configured AI providers failed. Primary ${primary}: ${primaryDetail}${fallbackFailures.length ? `; ${fallbackFailures.join("; ")}` : ""}`,
    {
      code,
      provider: primary,
      retryable: retryableErrors.length > 0,
      retryAfterMs: retryAfterMs || undefined,
      cause: primaryError,
    },
  );
}
