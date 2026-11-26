import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AiCompletionRequest, AiCompletionResult, AiProviderAdapter } from "@/lib/ai/contracts";
import { AiProviderError } from "@/lib/ai/errors";
import { completeAiTask } from "@/lib/ai/provider-completion";
import { getAiProviderAdapter, resolveProviderPlan } from "@/lib/ai/provider-plan";

vi.mock("@/lib/ai/provider-plan", () => ({
  getAiProviderAdapter: vi.fn(),
  resolveProviderPlan: vi.fn(),
}));

const request: AiCompletionRequest = {
  task: "job-requirement-extraction",
  systemPrompt: "Extract job requirements.",
  userPrompt: "Job advert.",
  responseFormat: "json",
  maxOutputTokens: 4_096,
};

describe("AI task provider fallback", () => {
  beforeEach(() => vi.clearAllMocks());

  it("moves directly to the configured fallback after a deterministic output-limit failure", async () => {
    const groqComplete = vi.fn<AiProviderAdapter["complete"]>().mockRejectedValue(
      new AiProviderError("Groq output was truncated.", {
        code: "output-limit",
        provider: "groq",
      }),
    );
    const geminiResult: AiCompletionResult = {
      content: '{"summary":"Role","responsibilities":[],"capabilities":[],"requirements":[],"coverage":"complete"}',
      provider: "gemini",
      model: "test-gemini",
    };
    const geminiComplete = vi.fn<AiProviderAdapter["complete"]>().mockResolvedValue(geminiResult);

    vi.mocked(resolveProviderPlan).mockReturnValue({
      primary: "groq",
      fallbacks: ["gemini"],
    });
    vi.mocked(getAiProviderAdapter).mockImplementation((provider) =>
      provider === "groq"
        ? { provider: "groq", complete: groqComplete }
        : { provider: "gemini", complete: geminiComplete },
    );

    await expect(completeAiTask(request)).resolves.toEqual(geminiResult);
    expect(groqComplete).toHaveBeenCalledOnce();
    expect(geminiComplete).toHaveBeenCalledOnce();
  });
});
