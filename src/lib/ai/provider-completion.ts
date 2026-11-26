import type { AiCompletionRequest, AiCompletionResult } from "./contracts";
import { AiProviderError } from "./errors";
import {
  parseProviderList,
  providerFlagIsEnabled,
  type SupportedProvider,
} from "./provider-config";
import { completeWithFallbacks } from "./provider-fallback";
import { getAiProviderAdapter, resolveProviderPlan } from "./provider-plan";
import { completeWithRetry } from "./provider-retry";

export async function completeAiTaskWithProvider(
  provider: SupportedProvider,
  request: AiCompletionRequest,
): Promise<AiCompletionResult> {
  const configured = parseProviderList(process.env.AI_ENABLED_PROVIDERS);
  if (!configured.includes(provider) || !providerFlagIsEnabled(provider)) {
    throw new AiProviderError(
      `Provider "${provider}" must be included in AI_ENABLED_PROVIDERS and its provider-specific flag must be true.`,
      { code: "configuration", provider },
    );
  }
  return completeWithRetry(getAiProviderAdapter(provider), request);
}

export async function completeAiTask(
  request: AiCompletionRequest,
): Promise<AiCompletionResult> {
  const { primary, fallbacks } = resolveProviderPlan();
  try {
    return await completeWithRetry(getAiProviderAdapter(primary), request);
  } catch (primaryError) {
    if (
      !(primaryError instanceof AiProviderError) ||
      !primaryError.retryable ||
      !fallbacks.length
    ) {
      throw primaryError;
    }
    return completeWithFallbacks(primary, fallbacks, request, primaryError);
  }
}
