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

function configuredFallbackProviders(primary: AiProvider): AiProvider[] {
  const configured = process.env.AI_PROVIDER_FALLBACKS?.split(",").map((value) => value.trim()).filter(Boolean) ?? [];
  const valid = new Set<AiProvider>(["ollama-local", "gemini", "groq"]);
  const fallbacks: AiProvider[] = [];

  for (const value of configured) {
    if (!valid.has(value as AiProvider)) {
      throw new AiProviderError(`Unsupported AI_PROVIDER_FALLBACKS entry "${value}".`, { code: "configuration" });
    }
    const provider = value as AiProvider;
    if (provider !== primary && !fallbacks.includes(provider)) fallbacks.push(provider);
  }
  return fallbacks;
}

export async function completeAiTask(request: AiCompletionRequest): Promise<AiCompletionResult> {
  const primary = activeProvider();
  try {
    return await completeWithRetry(getAiProviderAdapter(primary), request);
  } catch (primaryError) {
    if (!(primaryError instanceof AiProviderError) || !primaryError.retryable) throw primaryError;

    const fallbacks = configuredFallbackProviders(primary);
    if (!fallbacks.length) throw primaryError;

    for (const provider of fallbacks) {
      console.warn("[AI provider] Primary provider unavailable; trying explicitly configured fallback", {
        primary,
        fallback: provider,
        task: request.task,
        code: primaryError.code,
      });
      try {
        const result = await completeWithRetry(getAiProviderAdapter(provider), request);
        console.info("[AI provider] Fallback provider completed task", {
          primary,
          provider: result.provider,
          model: result.model,
          task: request.task,
        });
        return result;
      } catch (fallbackError) {
        if (!(fallbackError instanceof AiProviderError) || !fallbackError.retryable) throw fallbackError;
        console.warn("[AI provider] Configured fallback is also unavailable", {
          provider,
          task: request.task,
          code: fallbackError.code,
        });
      }
    }
    throw primaryError;
  }
}
