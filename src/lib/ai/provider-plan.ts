import type { AiProviderAdapter } from "./contracts";
import { AiProviderError } from "./errors";
import { createGeminiAdapter } from "./providers/gemini-adapter";
import { createGroqAdapter } from "./providers/groq-adapter";
import { createOllamaLocalAdapter } from "./providers/ollama-local-adapter";
import {
  ENABLED_FLAGS,
  parseProviderList,
  providerFlagIsEnabled,
  PROVIDERS,
  type SupportedProvider,
} from "./provider-config";

export function resolveProviderPlan(): {
  primary: SupportedProvider;
  fallbacks: SupportedProvider[];
} {
  const configured = parseProviderList(process.env.AI_ENABLED_PROVIDERS);
  const enabled = configured.filter(providerFlagIsEnabled);
  if (!enabled.length) {
    throw new AiProviderError(
      "No provider is enabled by both AI_ENABLED_PROVIDERS and its provider-specific flag.",
      { code: "configuration" },
    );
  }

  const requested =
    process.env.AI_PROVIDER?.trim() ||
    process.env.AI_DEFAULT_PROVIDER?.trim();
  if (!requested || !(PROVIDERS as readonly string[]).includes(requested)) {
    throw new AiProviderError(
      "Set AI_PROVIDER or AI_DEFAULT_PROVIDER to a supported provider.",
      { code: "configuration" },
    );
  }
  const primary = requested as SupportedProvider;
  if (!enabled.includes(primary)) {
    throw new AiProviderError(
      `Selected provider "${primary}" is not enabled. Check AI_ENABLED_PROVIDERS and ${ENABLED_FLAGS[primary]}.`,
      { code: "configuration", provider: primary },
    );
  }
  return {
    primary,
    fallbacks: enabled.filter((provider) => provider !== primary),
  };
}

export function getAiProviderAdapter(
  provider: SupportedProvider,
): AiProviderAdapter {
  if (provider === "ollama-local") return createOllamaLocalAdapter();
  if (provider === "gemini") return createGeminiAdapter();
  if (provider === "groq") return createGroqAdapter();
  throw new AiProviderError(
    "The configured AI provider is not supported for this environment.",
    { code: "configuration", provider },
  );
}
