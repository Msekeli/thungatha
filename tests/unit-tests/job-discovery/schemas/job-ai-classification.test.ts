import { describe, expect, it } from "vitest";
import { matchAssessmentInputSchema } from "@/thungatha-features/job-discovery/server/job-ai-schemas";
import { validateAndClassifyAssessment } from "@/thungatha-features/job-discovery/server/job-ai-classification";
import { jobUnderstandingSchema } from "@/thungatha-features/job-discovery/server/job-ai-schemas";

const jobRefs = new Set(["job:segment:1"]);
const profileRefs = new Set(["profile:skills[0].name"]);
const understanding = jobUnderstandingSchema.parse({ summary: "Role", responsibilities: [], capabilities: [], requirements: [{ id: "r1", statement: "Build software", category: "skill", importance: "preferred", sourceEvidenceRefs: ["job:segment:1"] }], coverage: "complete" });
const input = {
  semanticAlignment: { level: "strong" as const, materialGaps: false, jobEvidenceRefs: ["job:segment:1"], profileEvidenceRefs: ["profile:skills[0].name"] },
  summary: "The candidate's confirmed evidence aligns with the central work.",
  alignmentExplanation: "The supplied evidence supports the responsibilities described.",
  requirements: [{ id: "r1", requirement: "Build software", importance: "preferred" as const, assessment: "supported" as const, explanation: "Confirmed software development evidence.", jobEvidenceRefs: ["job:segment:1"], profileEvidenceRefs: ["profile:skills[0].name"] }],
  gaps: [],
};

describe("AI assessment classification policy", () => {
  it("derives Match from strong alignment without material gaps", () => {
    const parsed = matchAssessmentInputSchema.parse(input);
    expect(validateAndClassifyAssessment(parsed, understanding, jobRefs, profileRefs).classification).toBe("match");
  });
  it("downgrades strong alignment with material gaps to Relevant", () => {
    const parsed = matchAssessmentInputSchema.parse({ ...input, semanticAlignment: { ...input.semanticAlignment, materialGaps: true } });
    expect(validateAndClassifyAssessment(parsed, jobRefs, profileRefs).classification).toBe("relevant");
  });
  it("classifies meaningful alignment as Relevant", () => {
    const parsed = matchAssessmentInputSchema.parse({ ...input, semanticAlignment: { ...input.semanticAlignment, level: "meaningful" } });
    expect(validateAndClassifyAssessment(parsed, jobRefs, profileRefs).classification).toBe("relevant");
  });
  it("classifies insufficient evidence as Unclassified", () => {
    const parsed = matchAssessmentInputSchema.parse({ ...input, semanticAlignment: { level: "insufficient", materialGaps: true, jobEvidenceRefs: ["job:segment:1"], profileEvidenceRefs: [] } });
    expect(validateAndClassifyAssessment(parsed, jobRefs, profileRefs).classification).toBe("unclassified");
  });
  it("rejects a reference outside the supplied evidence", () => {
    const parsed = matchAssessmentInputSchema.parse(input);
    expect(() => validateAndClassifyAssessment(parsed, understanding, jobRefs, new Set())).toThrow(/outside the supplied/);
  });
  it("rejects supported requirements without Profile evidence", () => {
    expect(matchAssessmentInputSchema.safeParse({ ...input, requirements: [{ ...input.requirements[0], profileEvidenceRefs: [] }] }).success).toBe(false);
  });
  it("downgrades a contradiction to Relevant even when alignment is otherwise strong", () => {
    const parsed = matchAssessmentInputSchema.parse({ ...input, requirements: [{ ...input.requirements[0], assessment: "contradictory" }] });
    expect(validateAndClassifyAssessment(parsed, jobRefs, profileRefs).classification).toBe("relevant");
  });
});
