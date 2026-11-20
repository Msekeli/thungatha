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
