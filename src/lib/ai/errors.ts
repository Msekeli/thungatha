import type { AiProvider } from "./contracts";

export type AiErrorCode =
  | "configuration"
  | "authentication"
  | "rate-limited"
  | "timeout"
  | "unavailable"
  | "invalid-response"
  | "content-filtered"
  | "unknown";

export interface AiProviderErrorOptions {
  code: AiErrorCode;
  provider?: AiProvider;
  retryable?: boolean;
  retryAfterMs?: number;
  cause?: unknown;
}

export class AiProviderError extends Error {
  readonly code: AiErrorCode;
  readonly provider?: AiProvider;
  readonly retryable: boolean;
  readonly retryAfterMs?: number;

  constructor(message: string, options: AiProviderErrorOptions) {
    super(message, { cause: options.cause });
    this.name = "AiProviderError";
    this.code = options.code;
    this.provider = options.provider;
    this.retryable = options.retryable ?? false;
    this.retryAfterMs = options.retryAfterMs;
  }
}

export function parseRetryAfterMs(value: string | null): number | undefined {
  if (!value) return undefined;
  const seconds = Number(value);
  if (Number.isFinite(seconds) && seconds >= 0) return seconds * 1_000;
  const date = Date.parse(value);
  return Number.isNaN(date) ? undefined : Math.max(0, date - Date.now());
}

export function createProviderHttpError(
  provider: AiProvider,
  status: number,
  retryAfterHeader: string | null,
  payload: unknown,
): AiProviderError {
  const errorObject = payload && typeof payload === "object"
    ? (payload as { error?: unknown; message?: unknown }).error
    : undefined;
  const detailObject = errorObject && typeof errorObject === "object"
    ? errorObject as { message?: unknown; status?: unknown }
    : undefined;
  const detail = typeof detailObject?.message === "string"
    ? detailObject.message
    : payload && typeof payload === "object" && typeof (payload as { message?: unknown }).message === "string"
      ? (payload as { message: string }).message
      : undefined;
  const safeDetail = detail?.replace(/\s+/g, " ").slice(0, 240);
  const isTokenCapacityLimit = status === 413 && /tokens per minute|TPM|requested \d+/i.test(detail ?? "");
  const code: AiErrorCode = isTokenCapacityLimit
    ? "rate-limited"
    : status === 401 || status === 403
      ? "authentication"
      : status === 429
        ? "rate-limited"
        : status === 408
          ? "timeout"
          : status >= 500
            ? "unavailable"
            : "unknown";
  const retryable = isTokenCapacityLimit || status === 408 || status === 429 || status >= 500;
  return new AiProviderError(
    `${provider === "ollama-local" ? "Ollama" : provider === "gemini" ? "Gemini" : "Groq"} returned HTTP ${status}.${safeDetail ? ` ${safeDetail}` : ""}`,
    {
      code,
      provider,
      retryable,
      retryAfterMs: parseRetryAfterMs(retryAfterHeader),
    },
  );
}
