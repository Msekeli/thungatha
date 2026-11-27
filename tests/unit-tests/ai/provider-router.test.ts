import { describe, expect, it, vi } from "vitest";
import type {
  AiCompletionRequest,
  AiCompletionResult,
  AiProviderAdapter,
} from "@/lib/ai/contracts";
import { AiProviderError } from "@/lib/ai/errors";
import {
  completeWithRetry,
  resolveProviderPlan,
} from "@/lib/ai/provider-router";

const request: AiCompletionRequest = {
  task: "job-requirement-extraction",
  systemPrompt: "Return JSON.",
  userPrompt: "Extract job requirements.",
  responseFormat: "json",
};

function result(): AiCompletionResult {
  return { content: '{"ok":true}', provider: "gemini", model: "test-model" };
}

describe("AI provider configuration", () => {
  it("uses Groq as primary and Gemini as fallback when both are enabled in that order", () => {
    vi.stubEnv("AI_ENABLED_PROVIDERS", "groq,gemini");
    vi.stubEnv("AI_PROVIDER", "groq");
    vi.stubEnv("AI_DEFAULT_PROVIDER", "groq");
    vi.stubEnv("GROQ_ENABLED", "true");
    vi.stubEnv("GEMINI_ENABLED", "true");
    vi.stubEnv("OLLAMA_LOCAL_ENABLED", "false");

    expect(resolveProviderPlan()).toEqual({
      primary: "groq",
      fallbacks: ["gemini"],
    });
  });

  it("uses only Gemini when it is the sole listed and enabled provider", () => {
    vi.stubEnv("AI_ENABLED_PROVIDERS", "gemini");
    vi.stubEnv("AI_PROVIDER", "gemini");
    vi.stubEnv("AI_DEFAULT_PROVIDER", "gemini");
    vi.stubEnv("GEMINI_ENABLED", "true");
    vi.stubEnv("GROQ_ENABLED", "false");
    vi.stubEnv("OLLAMA_LOCAL_ENABLED", "true");
    expect(resolveProviderPlan()).toEqual({ primary: "gemini", fallbacks: [] });
  });

  it("does not allow provider flags to override the allow-list", () => {
    vi.stubEnv("AI_ENABLED_PROVIDERS", "gemini");
    vi.stubEnv("AI_PROVIDER", "gemini");
    vi.stubEnv("GEMINI_ENABLED", "true");
    vi.stubEnv("GROQ_ENABLED", "true");
    expect(resolveProviderPlan()).toEqual({ primary: "gemini", fallbacks: [] });
  });

  it("rejects a selected provider that is disabled", () => {
    vi.stubEnv("AI_ENABLED_PROVIDERS", "gemini");
    vi.stubEnv("AI_PROVIDER", "groq");
    vi.stubEnv("GEMINI_ENABLED", "true");
    vi.stubEnv("GROQ_ENABLED", "true");
    expect(() => resolveProviderPlan()).toThrow(/not enabled/);
  });

  it("uses only enabled providers after the primary as ordered fallbacks", () => {
    vi.stubEnv("AI_ENABLED_PROVIDERS", "gemini,groq,ollama-local");
    vi.stubEnv("AI_PROVIDER", "gemini");
    vi.stubEnv("GEMINI_ENABLED", "true");
    vi.stubEnv("GROQ_ENABLED", "true");
    vi.stubEnv("OLLAMA_LOCAL_ENABLED", "false");
    expect(resolveProviderPlan()).toEqual({
      primary: "gemini",
      fallbacks: ["groq"],
    });
  });
});

describe("AI provider retry policy", () => {
  it("retries one transient provider failure and returns the next successful result", async () => {
    const complete = vi
      .fn<AiProviderAdapter["complete"]>()
      .mockRejectedValueOnce(
        new AiProviderError("Gemini returned HTTP 503.", {
          code: "unavailable",
          provider: "gemini",
          retryable: true,
        }),
      )
      .mockResolvedValueOnce(result());
    const adapter: AiProviderAdapter = { provider: "gemini", complete };
    const sleep = vi.fn(async () => undefined);
    await expect(
      completeWithRetry(adapter, request, { sleep, random: () => 0 }),
    ).resolves.toEqual(result());
    expect(complete).toHaveBeenCalledTimes(2);
    expect(sleep).toHaveBeenCalledWith(250);
  });

  it("does not retry authentication or configuration failures", async () => {
    const complete = vi
      .fn<AiProviderAdapter["complete"]>()
      .mockRejectedValue(
        new AiProviderError("Invalid credentials.", {
          code: "authentication",
          provider: "gemini",
        }),
      );
    const adapter: AiProviderAdapter = { provider: "gemini", complete };
    await expect(
      completeWithRetry(adapter, request, { sleep: vi.fn() }),
    ).rejects.toMatchObject({ code: "authentication" });
    expect(complete).toHaveBeenCalledTimes(1);
  });

  it("does not retry timeouts because queue retry owns long-running failures", async () => {
    const complete = vi
      .fn<AiProviderAdapter["complete"]>()
      .mockRejectedValue(
        new AiProviderError("Request timed out.", {
          code: "timeout",
          provider: "gemini",
          retryable: true,
        }),
      );
    const adapter: AiProviderAdapter = { provider: "gemini", complete };
    await expect(
      completeWithRetry(adapter, request, { sleep: vi.fn() }),
    ).rejects.toMatchObject({ code: "timeout" });
    expect(complete).toHaveBeenCalledTimes(1);
  });

  it("defers long Retry-After windows to the durable queue", async () => {
    const complete = vi.fn<AiProviderAdapter["complete"]>().mockRejectedValue(
      new AiProviderError("Rate limited.", {
        code: "rate-limited",
        provider: "gemini",
        retryable: true,
        retryAfterMs: 30_000,
      }),
    );
    const adapter: AiProviderAdapter = { provider: "gemini", complete };
    const sleep = vi.fn();
    await expect(
      completeWithRetry(adapter, request, { sleep }),
    ).rejects.toMatchObject({ code: "rate-limited" });
    expect(complete).toHaveBeenCalledTimes(1);
    expect(sleep).not.toHaveBeenCalled();
  });
});
