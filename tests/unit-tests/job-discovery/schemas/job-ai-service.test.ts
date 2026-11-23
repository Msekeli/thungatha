import { beforeEach, describe, expect, it, vi } from "vitest";
import { completeAiTask } from "@/lib/ai/provider-router";
import { understandJobWithAi, parseJobUnderstanding } from "@/thungatha-features/job-discovery/server/job-ai-service";
import { createMatchAssessmentResponseSchema } from "@/thungatha-features/job-discovery/server/job-ai-schemas";
import type { JobMatchingContext } from "@/thungatha-features/job-discovery/server/job-ai-queue-eligibility";

vi.mock("@/lib/ai/provider-router", () => ({
  completeAiTask: vi.fn(),
}));

const context: JobMatchingContext = { title: "Data Analyst", employerName: "Example Employer", locationText: "Cape Town", description: "Responsible for analysing data. Preparing reports. Maintaining compliance records. Coordinating teams. Supporting audits." };

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

    const parsed = await understandJobWithAi(context);
    expect(parsed.analysis.responsibilities).toHaveLength(1);
    expect(completeAiTask).toHaveBeenCalledOnce();
    const request = vi.mocked(completeAiTask).mock.calls[0]?.[0];
    expect(request?.maxOutputTokens).toBeUndefined();
    expect(request?.responseSchema).toMatchObject({
      type: "OBJECT",
      properties: { responsibilities: { type: "ARRAY" } },
    });
  });

  it("rejects cached evidence references that do not belong to the current description", () => {
    expect(() => parseJobUnderstanding(context, {
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


describe("candidate assessment response contract", () => {
  const contract = createMatchAssessmentResponseSchema(
    ["job:segment:1", "job:context:title"],
    ["profile:skills[0].name"],
    ["req_1", "req_2"],
  );

  it("asks the model for requirement IDs without asking it to rewrite canonical wording", () => {
    const parsed = contract.validator.parse({
      semanticAlignment: {
        level: "strong",
        materialGaps: false,
        jobEvidenceRefs: ["job:segment:1"],
        profileEvidenceRefs: ["profile:skills[0].name"],
      },
      summary: "The evidence aligns with the role.",
      alignmentExplanation: "The supplied evidence supports the core work.",
      requirements: [{
        id: "req_1",
        assessment: "supported",
        explanation: "The profile demonstrates the required capability.",
        jobEvidenceRefs: ["job:segment:1"],
        profileEvidenceRefs: ["profile:skills[0].name"],
      }, {
        id: "req_2",
        assessment: "not_demonstrated",
        explanation: "The confirmed profile does not demonstrate this requirement.",
        jobEvidenceRefs: ["job:context:title"],
        profileEvidenceRefs: [],
      }],
      gaps: [],
    });
    expect(parsed.requirements.map((item) => item.id)).toEqual(["req_1", "req_2"]);
    expect(parsed.requirements[0]).not.toHaveProperty("requirement");
    expect(parsed.requirements[0]).not.toHaveProperty("importance");
  });

  it("rejects evidence IDs that were not supplied to the model", () => {
    const result = contract.validator.safeParse({
      semanticAlignment: {
        level: "meaningful",
        materialGaps: true,
        jobEvidenceRefs: ["job:segment:999"],
        profileEvidenceRefs: ["profile:skills[0].name"],
      },
      summary: "Assessment.",
      alignmentExplanation: "Evidence is limited.",
      requirements: [],
      gaps: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejects requirement IDs that were not extracted", () => {
    const result = contract.validator.safeParse({
      semanticAlignment: {
        level: "meaningful",
        materialGaps: true,
        jobEvidenceRefs: ["job:segment:1"],
        profileEvidenceRefs: ["profile:skills[0].name"],
      },
      summary: "Assessment.",
      alignmentExplanation: "Evidence is limited.",
      requirements: [{
        id: "invented_requirement",
        assessment: "uncertain",
        explanation: "Uncertain.",
        jobEvidenceRefs: ["job:segment:1"],
        profileEvidenceRefs: [],
      }],
      gaps: [],
    });
    expect(result.success).toBe(false);
  });
});
