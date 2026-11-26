export const AI_PROVIDERS = [
  "ollama-local",
  "ollama-cloud",
  "gemini",
  "groq",
] as const;
export type AiProvider = (typeof AI_PROVIDERS)[number];

export const AI_TASKS = [
  "job-requirement-extraction",
  "job-fit-assessment",
  "cv-profile-extraction",
  "job-fit-explanation",
  "cv-tailoring",
  "cover-letter-draft",
  "interview-preparation",
] as const;
export type AiTask = (typeof AI_TASKS)[number];
export type AiResponseFormat = "text" | "json";

export interface AiCompletionRequest {
  task: AiTask;
  systemPrompt: string;
  userPrompt: string;
  responseFormat: AiResponseFormat;
  /** Provider-supported JSON Schema for constrained structured output. */
  responseSchema?: Record<string, unknown>;
  temperature?: number;
  maxOutputTokens?: number;
  timeoutMs?: number;
  reasoning?: boolean;
}

export interface AiTokenUsage {
  inputTokens?: number;
  outputTokens?: number;
}

export interface AiCompletionResult {
  content: string;
  provider: AiProvider;
  model: string;
  usage?: AiTokenUsage;
  finishReason?: string;
}

export interface AiProviderAdapter {
  readonly provider: AiProvider;
  complete(request: AiCompletionRequest): Promise<AiCompletionResult>;
}
