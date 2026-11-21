import { beforeEach, describe, expect, it, vi } from "vitest";
import { completeAiTask } from "@/lib/ai/provider-router";
import { understandJobWithAi, parseJobUnderstanding } from "@/thungatha-features/job-discovery/server/job-ai-service";

vi.mock("@/lib/ai/provider-router", () => ({
  completeAiTask: vi.fn(),
}));

const description = "Responsible for analysing data, preparing reports and maintaining compliance records.";

describe("job understanding service", () => {
  beforeEach(() => vi.clearAllMocks());

  it("sends Gemini a schema that constrains evidence references to the Zod limit", async () => {
    vi.mocked(completeAiTask).mockResolvedValue({
      provider: "gemini",
      model: "test-model",
      content: JSON.stringify({
        summary: "Analyses data and supports compliance.",
        responsibilities: [{
          id: "resp-1",
          statement: "Analyse data and prepare reports.",
          sourceEvidenceRefs: ["job:segment:1"],
        }],
        capabilities: [],
        requirements: [],
        coverage: "complete",
      }),
    });

    await understandJobWithAi(description);

    expect(completeAiTask).toHaveBeenCalledOnce();
    const request = vi.mocked(completeAiTask).mock.calls[0]?.[0];
    expect(request?.responseSchema).toMatchObject({
      type: "OBJECT",
      properties: {
        responsibilities: {
          maxItems: 12,
          items: {
            properties: {
              sourceEvidenceRefs: { minItems: 1, maxItems: 4 },
            },
          },
        },
      },
    });
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
