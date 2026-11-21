import "server-only";
import type { AiCompletionRequest, AiCompletionResult, AiProvider, AiProviderAdapter } from "./contracts";
import { AiProviderError } from "./errors";
import { createGeminiAdapter } from "./providers/gemini-adapter";
import { createGroqAdapter } from "./providers/groq-adapter";
import { createOllamaLocalAdapter } from "./providers/ollama-local-adapter";

function activeProvider(): AiProvider {
  const value = process.env.AI_PROVIDER;
  if (value === "ollama-local" || value === "gemini" || value === "groq") return value;
  throw new AiProviderError("Set AI_PROVIDER explicitly to ollama-local, gemini, or groq.", {
    code: "configuration",
  });
}

export function getAiProviderAdapter(provider = activeProvider()): AiProviderAdapter {
  if (provider === "ollama-local") return createOllamaLocalAdapter();
  if (provider === "gemini") return createGeminiAdapter();
  if (provider === "groq") return createGroqAdapter();
  throw new AiProviderError("The configured AI provider is not supported for this environment.", {
    code: "configuration", provider,
  });
}

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
  const sleep = runtime.sleep ?? ((milliseconds: number) =>
    new Promise<void>((resolve) => setTimeout(resolve, milliseconds)));
  const random = runtime.random ?? Math.random;

  for (let attempt = 1; attempt <= MAX_PROVIDER_ATTEMPTS; attempt += 1) {
    try {
      return await adapter.complete(request);
    } catch (error) {
      if (!(error instanceof AiProviderError)
        || !error.retryable
        || error.code === "timeout"
        || attempt === MAX_PROVIDER_ATTEMPTS) {
        throw error;
      }

      // Long Retry-After windows belong to the durable queue retry, not an
      // in-process wait that could consume the serverless worker's time budget.
      if (error.retryAfterMs !== undefined && error.retryAfterMs > MAX_INLINE_RETRY_DELAY_MS) {
        throw error;
      }

      const delayMs = error.retryAfterMs
        ?? Math.round(250 * (2 ** (attempt - 1)) + random() * 250);
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
    code: "unknown", provider: adapter.provider,
  });
}

export async function completeAiTask(request: AiCompletionRequest): Promise<AiCompletionResult> {
  return completeWithRetry(getAiProviderAdapter(), request);
}
