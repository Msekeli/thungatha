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

export async function completeAiTask(request: AiCompletionRequest): Promise<AiCompletionResult> {
  return getAiProviderAdapter().complete(request);
}
