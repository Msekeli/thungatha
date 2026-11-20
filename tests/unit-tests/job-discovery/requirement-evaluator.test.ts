import { describe, expect, it } from "vitest";
import { evaluateRequirement } from "@/thungatha-features/job-discovery/server/requirement-evaluator";
import type { CandidateFacts } from "@/thungatha-features/job-discovery/server/relevance-classifier";

const candidate = (qualification: string): CandidateFacts => ({
  profileVersion: 1,
  confirmedAt: "2026-11-20T00:00:00Z",
  nextRole: null,
  skills: [],
  education: [{ educationLevel: null, qualification, fieldOfStudy: null, sourcePath: "education[0]" }],
  certifications: [],
  languages: [],
  employment: [],
  knownEmploymentMonths: 0,
  unknownEmploymentSourcePaths: [],
}) as CandidateFacts;

const requirement = {
  id: "education-1",
  category: "education" as const,
  value: "NSC",
  importance: "mandatory" as const,
  sourceText: "Required: NSC",
  confidence: "explicit" as const,
};

describe("education requirement matching", () => {
  it("matches an explicit school qualification alias", () => {
    expect(evaluateRequirement(candidate("National Senior Certificate"), requirement).outcome).toBe("met");
  });

  it("does not match an incidental NSC substring", () => {
    expect(evaluateRequirement(candidate("AdvancedNSCProgramme"), requirement).outcome).toBe("cant_tell");
  });
});
