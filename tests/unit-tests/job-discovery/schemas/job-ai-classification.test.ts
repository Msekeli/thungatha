import { describe, expect, it } from "vitest";
import { jobUnderstandingSchema, matchAssessmentInputSchema } from "@/thungatha-features/job-discovery/server/job-ai-schemas";
import { AssessmentUnavailableError, MATCH_CLASSIFICATION_POLICY_VERSION, validateAndClassifyAssessment } from "@/thungatha-features/job-discovery/server/job-ai-classification";

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
    const result = validateAndClassifyAssessment(matchAssessmentInputSchema.parse(input), understanding, jobRefs, profileRefs);
    expect(result.classification).toBe("match");
    expect(result.classificationPolicyVersion).toBe(MATCH_CLASSIFICATION_POLICY_VERSION);
  });
  it("derives Relevant from strong alignment with material gaps", () => {
    const parsed = matchAssessmentInputSchema.parse({ ...input, semanticAlignment: { ...input.semanticAlignment, materialGaps: true } });
    expect(validateAndClassifyAssessment(parsed, understanding, jobRefs, profileRefs).classification).toBe("relevant");
  });
  it("derives Relevant from meaningful alignment", () => {
    const parsed = matchAssessmentInputSchema.parse({ ...input, semanticAlignment: { ...input.semanticAlignment, level: "meaningful" } });
    expect(validateAndClassifyAssessment(parsed, understanding, jobRefs, profileRefs).classification).toBe("relevant");
  });
  it("returns an unavailable state instead of a third classification when evidence is insufficient", () => {
    const parsed = matchAssessmentInputSchema.parse({ ...input, semanticAlignment: { level: "insufficient", materialGaps: true, jobEvidenceRefs: ["job:segment:1"], profileEvidenceRefs: [] } });
    expect(() => validateAndClassifyAssessment(parsed, understanding, jobRefs, profileRefs)).toThrow(AssessmentUnavailableError);
  });
  it("rejects a reference outside the supplied evidence", () => {
    const parsed = matchAssessmentInputSchema.parse(input);
    expect(() => validateAndClassifyAssessment(parsed, understanding, jobRefs, new Set())).toThrow(/outside the supplied/);
  });
  it("rejects supported requirements without Profile evidence", () => {
    expect(matchAssessmentInputSchema.safeParse({ ...input, requirements: [{ ...input.requirements[0], profileEvidenceRefs: [] }] }).success).toBe(false);
  });
  it("prevents Match when a mandatory requirement is not demonstrated", () => {
    const mandatory = jobUnderstandingSchema.parse({ ...understanding, requirements: [{ ...understanding.requirements[0], importance: "mandatory" }] });
    const parsed = matchAssessmentInputSchema.parse({ ...input, requirements: [{ ...input.requirements[0], importance: "mandatory", assessment: "not_demonstrated", profileEvidenceRefs: [] }] });
    expect(validateAndClassifyAssessment(parsed, mandatory, jobRefs, profileRefs).classification).toBe("relevant");
  });
  it("rejects duplicate identifiers in extracted requirements", () => {
    const duplicated = jobUnderstandingSchema.parse({ ...understanding, requirements: [...understanding.requirements, ...understanding.requirements] });
    const parsed = matchAssessmentInputSchema.parse({ ...input, requirements: [input.requirements[0], input.requirements[0]] });
    expect(() => validateAndClassifyAssessment(parsed, duplicated, jobRefs, profileRefs)).toThrow(/duplicate identifiers/);
  });
  it("rejects omitted or reclassified extracted requirements", () => {
    const omitted = matchAssessmentInputSchema.parse({ ...input, requirements: [] });
    expect(() => validateAndClassifyAssessment(omitted, understanding, jobRefs, profileRefs)).toThrow(/omitted/);
    const wrongImportance = matchAssessmentInputSchema.parse({ ...input, requirements: [{ ...input.requirements[0], importance: "mandatory" }] });
    expect(() => validateAndClassifyAssessment(wrongImportance, understanding, jobRefs, profileRefs)).toThrow(/do not match/);
  });
  it("rejects changed requirement wording", () => {
    const changed = matchAssessmentInputSchema.parse({ ...input, requirements: [{ ...input.requirements[0], requirement: "Develop applications" }] });
    expect(() => validateAndClassifyAssessment(changed, understanding, jobRefs, profileRefs)).toThrow(/changed the extracted wording/);
  });
  it("prevents Match when contradictory requirement evidence exists", () => {
    const parsed = matchAssessmentInputSchema.parse({ ...input, requirements: [{ ...input.requirements[0], assessment: "contradictory" }] });
    expect(validateAndClassifyAssessment(parsed, understanding, jobRefs, profileRefs).classification).toBe("relevant");
  });
});
