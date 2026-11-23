import "server-only";
import type { AiCompletionRequest, AiCompletionResult, AiProvider, AiProviderAdapter } from "./contracts";
import { AiProviderError } from "./errors";
import { createGeminiAdapter } from "./providers/gemini-adapter";
import { createGroqAdapter } from "./providers/groq-adapter";
import { createOllamaLocalAdapter } from "./providers/ollama-local-adapter";

const PROVIDERS = ["ollama-local", "gemini", "groq"] as const satisfies readonly AiProvider[];
const ENABLED_FLAGS: Record<AiProvider, string> = {
  "ollama-local": "OLLAMA_LOCAL_ENABLED",
  gemini: "GEMINI_ENABLED",
  groq: "GROQ_ENABLED",
};

function parseProviderList(value: string | undefined): AiProvider[] {
  if (!value?.trim()) {
    throw new AiProviderError("AI_ENABLED_PROVIDERS must list at least one enabled provider.", {
      code: "configuration",
    });
  }
  const entries = value.split(",").map((item) => item.trim()).filter(Boolean);
  const result: AiProvider[] = [];
  for (const entry of entries) {
    if (!PROVIDERS.includes(entry as AiProvider)) {
      throw new AiProviderError(`Unsupported provider "${entry}" in AI_ENABLED_PROVIDERS.`, {
        code: "configuration",
      });
    }
    const provider = entry as AiProvider;
    if (!result.includes(provider)) result.push(provider);
  }
  if (!result.length) {
    throw new AiProviderError("AI_ENABLED_PROVIDERS must list at least one enabled provider.", {
      code: "configuration",
    });
  }
  return result;
}

function providerFlagIsEnabled(provider: AiProvider): boolean {
  return process.env[ENABLED_FLAGS[provider]]?.trim().toLowerCase() === "true";
}

export function resolveProviderPlan(): { primary: AiProvider; fallbacks: AiProvider[] } {
  const configured = parseProviderList(process.env.AI_ENABLED_PROVIDERS);
  const enabled = configured.filter(providerFlagIsEnabled);
  if (!enabled.length) {
    throw new AiProviderError("No provider is enabled by both AI_ENABLED_PROVIDERS and its provider-specific flag.", {
      code: "configuration",
    });
  }

  const requested = process.env.AI_PROVIDER?.trim() || process.env.AI_DEFAULT_PROVIDER?.trim();
  if (!requested || !PROVIDERS.includes(requested as AiProvider)) {
    throw new AiProviderError("Set AI_PROVIDER or AI_DEFAULT_PROVIDER to a supported provider.", {
      code: "configuration",
    });
  }
  const primary = requested as AiProvider;
  if (!enabled.includes(primary)) {
    throw new AiProviderError(`Selected provider "${primary}" is not enabled. Check AI_ENABLED_PROVIDERS and ${ENABLED_FLAGS[primary]}.`, {
      code: "configuration", provider: primary,
    });
  }

  return { primary, fallbacks: enabled.filter((provider) => provider !== primary) };
}

export function getAiProviderAdapter(provider: AiProvider): AiProviderAdapter {
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
      if (error.retryAfterMs !== undefined && error.retryAfterMs > MAX_INLINE_RETRY_DELAY_MS) throw error;

      const delayMs = error.retryAfterMs
        ?? Math.round(250 * (2 ** (attempt - 1)) + random() * 250);
      console.warn("[AI provider] Retrying transient provider failure", {
        provider: error.provider ?? adapter.provider, code: error.code, attempt, delayMs,
      });
      await sleep(delayMs);
    }
  }
  throw new AiProviderError("AI provider retry loop exited unexpectedly.", {
    code: "unknown", provider: adapter.provider,
  });
}

export async function completeAiTask(request: AiCompletionRequest): Promise<AiCompletionResult> {
  const { primary, fallbacks } = resolveProviderPlan();
  try {
    return await completeWithRetry(getAiProviderAdapter(primary), request);
  } catch (primaryError) {
    if (!(primaryError instanceof AiProviderError) || !primaryError.retryable || !fallbacks.length) {
      throw primaryError;
    }
    for (const provider of fallbacks) {
      console.warn("[AI provider] Primary provider unavailable; trying enabled fallback", {
        primary, fallback: provider, task: request.task, code: primaryError.code,
      });
      try {
        const result = await completeWithRetry(getAiProviderAdapter(provider), request);
        console.info("[AI provider] Fallback provider completed task", {
          primary, provider: result.provider, model: result.model, task: request.task,
        });
        return result;
      } catch (fallbackError) {
        if (!(fallbackError instanceof AiProviderError) || !fallbackError.retryable) throw fallbackError;
        console.warn("[AI provider] Enabled fallback is also unavailable", {
          provider, task: request.task, code: fallbackError.code,
        });
      }
    }
    throw primaryError;
  }
}
