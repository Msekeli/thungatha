import type {
  AiCompletionRequest,
  AiCompletionResult,
  AiProviderAdapter,
} from "./contracts";
import { AiProviderError } from "./errors";

const MAX_PROVIDER_ATTEMPTS = 2;
const MAX_INLINE_RETRY_DELAY_MS = 2_000;

type RetryRuntime = {
  sleep?: (milliseconds: number) => Promise<void>;
  random?: () => number;
};

export async function completeWithRetry(
  adapter: AiProviderAdapter,
  request: AiCompletionRequest,
  runtime: RetryRuntime = {},
): Promise<AiCompletionResult> {
  const sleep =
    runtime.sleep ??
    ((milliseconds: number) =>
      new Promise<void>((resolve) => setTimeout(resolve, milliseconds)));
  const random = runtime.random ?? Math.random;

  for (let attempt = 1; attempt <= MAX_PROVIDER_ATTEMPTS; attempt += 1) {
    try {
      return await adapter.complete(request);
    } catch (error) {
      if (
        !(error instanceof AiProviderError) ||
        !error.retryable ||
        error.code === "timeout" ||
        attempt === MAX_PROVIDER_ATTEMPTS
      ) {
        throw error;
      }
      if (
        error.retryAfterMs !== undefined &&
        error.retryAfterMs > MAX_INLINE_RETRY_DELAY_MS
      ) {
        throw error;
      }
      const delayMs =
        error.retryAfterMs ??
        Math.round(250 * 2 ** (attempt - 1) + random() * 250);
      console.warn("[AI provider] Retrying transient provider failure", {
        provider: error.provider ?? adapter.provider,
        code: error.code,
        attempt,
        delayMs,
      });
      await sleep(delayMs);
    }
  }
  throw new AiProviderError("AI provider retry loop exited unexpectedly.", {
    code: "unknown",
    provider: adapter.provider,
  });
}
