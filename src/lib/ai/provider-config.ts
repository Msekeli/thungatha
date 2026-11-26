import type { AiProvider } from "./contracts";
import { AiProviderError } from "./errors";

export type SupportedProvider = Exclude<AiProvider, "ollama-cloud">;

export const PROVIDERS = [
  "ollama-local",
  "gemini",
  "groq",
] as const satisfies readonly SupportedProvider[];

export const ENABLED_FLAGS: Record<SupportedProvider, string> = {
  "ollama-local": "OLLAMA_LOCAL_ENABLED",
  gemini: "GEMINI_ENABLED",
  groq: "GROQ_ENABLED",
};

export function parseProviderList(
  value: string | undefined,
): SupportedProvider[] {
  if (!value?.trim()) {
    throw new AiProviderError(
      "AI_ENABLED_PROVIDERS must list at least one enabled provider.",
      { code: "configuration" },
    );
  }
  const entries = value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const result: SupportedProvider[] = [];
  for (const entry of entries) {
    if (!(PROVIDERS as readonly string[]).includes(entry)) {
      throw new AiProviderError(
        `Unsupported provider "${entry}" in AI_ENABLED_PROVIDERS.`,
        { code: "configuration" },
      );
    }
    const provider = entry as SupportedProvider;
    if (!result.includes(provider)) result.push(provider);
  }
  if (!result.length) {
    throw new AiProviderError(
      "AI_ENABLED_PROVIDERS must list at least one enabled provider.",
      { code: "configuration" },
    );
  }
  return result;
}

export function providerFlagIsEnabled(
  provider: SupportedProvider,
): boolean {
  return process.env[ENABLED_FLAGS[provider]]?.trim().toLowerCase() === "true";
}
