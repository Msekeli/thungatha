import { describe, expect, it } from "vitest";
import { retainApprovedSuggestions } from "@/thungatha-features/cv-studio/server/verify-cv-tailoring-suggestions";
import { createCvTailoringResponseSchema } from "@/thungatha-features/cv-studio/server/cv-tailoring-schema";

const suggestions = [
  { targetPath: "professionalSummary", originalText: "A developer.", proposedText: "A web developer.", reason: "Clearer.", profileEvidenceRefs: ["cv:summary"], requirementIds: ["req-1"], jobEvidenceRefs: ["job:1"] },
  { targetPath: "headline", originalText: "Developer", proposedText: "Senior cloud architect", reason: "Matches role.", profileEvidenceRefs: ["cv:headline"], requirementIds: ["req-2"], jobEvidenceRefs: ["job:2"] },
];

describe("CV tailoring verification", () => {
  it("retains only suggestions approved by the independent reviewer", () => {
    const result = retainApprovedSuggestions(suggestions, [
      { index: 0, decision: "approve", issue: "" },
      { index: 1, decision: "reject", issue: "Unsupported seniority and cloud expertise." },
    ]);
    expect(result).toEqual([suggestions[0]]);
  });

  it("rejects incomplete or duplicate review results", () => {
    expect(() => retainApprovedSuggestions(suggestions, [
      { index: 0, decision: "approve", issue: "" },
    ])).toThrow(/every suggestion exactly once/);
    expect(() => retainApprovedSuggestions(suggestions, [
      { index: 0, decision: "approve", issue: "" },
      { index: 0, decision: "reject", issue: "Duplicate." },
    ])).toThrow(/every suggestion exactly once/);
  });

  it("rejects reviewer references outside the suggestion set", () => {
    expect(() => retainApprovedSuggestions(suggestions, [
      { index: 0, decision: "approve", issue: "" },
      { index: 1, decision: "approve", issue: "" },
      { index: 2, decision: "approve", issue: "" },
    ])).toThrow(/unknown suggestion/);
  });

  it("requires every requirement to be classified exactly once", () => {
    const schema = createCvTailoringResponseSchema(
      ["cv:summary"], ["job:1", "job:2"], ["professionalSummary"], ["req-1", "req-2"],
    );
    const complete = {
      suggestions: [],
      coveredRequirementIds: ["req-1"],
      gaps: [{ requirementId: "req-2", explanation: "The CV does not demonstrate this.", jobEvidenceRefs: ["job:2"] }],
    };
    expect(schema.validator.parse(complete)).toEqual(complete);
    expect(() => schema.validator.parse({
      ...complete, gaps: [],
    })).toThrow(/Every job requirement must be classified exactly once/);
    expect(() => schema.validator.parse({
      ...complete, coveredRequirementIds: ["req-1", "req-2"],
    })).toThrow(/Every job requirement must be classified exactly once/);
  });
});
