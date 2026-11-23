import { beforeEach, describe, expect, it, vi } from "vitest";
import { completeAiTask } from "@/lib/ai/provider-router";
import { understandJobWithAi, parseJobUnderstanding } from "@/thungatha-features/job-discovery/server/job-ai-service";

vi.mock("@/lib/ai/provider-router", () => ({
  completeAiTask: vi.fn(),
}));

const description = "Responsible for analysing data. Preparing reports. Maintaining compliance records. Coordinating teams. Supporting audits.";

describe("job understanding service", () => {
  beforeEach(() => vi.clearAllMocks());

  it("does not impose arbitrary extraction item or evidence-reference limits", async () => {
    vi.mocked(completeAiTask).mockResolvedValue({
      provider: "gemini",
      model: "test-model",
      content: JSON.stringify({
        summary: "Analyses data and supports compliance.",
        responsibilities: [{
          id: "resp-1",
          statement: "Analyse data and prepare reports.",
          sourceEvidenceRefs: ["job:segment:1", "job:segment:2", "job:segment:3", "job:segment:4", "job:segment:5"],
        }],
        capabilities: [],
        requirements: [],
        coverage: "complete",
      }),
    });

    const parsed = await understandJobWithAi(description);
    expect(parsed.analysis.responsibilities).toHaveLength(1);
    expect(completeAiTask).toHaveBeenCalledOnce();
    const request = vi.mocked(completeAiTask).mock.calls[0]?.[0];
    expect(request?.maxOutputTokens).toBeUndefined();
  });

  it("rejects cached evidence references that do not belong to the current description", () => {
    expect(() => parseJobUnderstanding(description, {
      summary: "Role",
      responsibilities: [{
        id: "resp-1",
        statement: "Analyse data.",
        sourceEvidenceRefs: ["job:segment:99"],
      }],
      capabilities: [],
      requirements: [],
      coverage: "complete",
    })).toThrow(/outside the current job description/);
  });
});
