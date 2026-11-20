import { describe, expect, it } from "vitest";
import { classifyJobRelevance, type CandidateFacts } from "@/thungatha-features/job-discovery/server/relevance-classifier";
import { jobRequirementsSchema } from "@/thungatha-features/job-discovery/server/job-requirement-schema";

const candidate = (overrides: Partial<CandidateFacts> = {}) => ({
  profileVersion: 1,
  confirmedAt: "2026-11-20T00:00:00Z",
  nextRole: null,
  skills: [{ value: "TypeScript", canonical: "TypeScript", sourcePath: "skills[0]" }],
  education: [],
  certifications: [],
  languages: [],
  employment: [{ id: "1", jobTitle: "Developer", employer: "Example", startMonth: 24000, endMonth: 24035, sourcePath: "workExperience[0]" }],
  knownEmploymentMonths: 36,
  unknownEmploymentSourcePaths: [],
  ...overrides,
}) as CandidateFacts;

const job = (requirements: Array<Record<string, unknown>>) => jobRequirementsSchema.parse({
  schemaVersion: 1,
  extractionVersion: "m3-c02-v2",
  descriptionHash: "a".repeat(64),
  roleFamily: null,
  requirements,
  status: "partial",
});

const requirement = (category: string, value: string, importance = "mandatory") => ({
  id: category + "-1", category, value, importance, sourceText: "Required: " + value,
  confidence: "explicit",
});

describe("classifyJobRelevance", () => {
  it("marks exact confirmed skills as met", () => {
    const result = classifyJobRelevance(candidate(), job([requirement("skill", "TypeScript")]));
    expect(result.classification).toBe("relevant");
    expect(result.requirements[0].profileEvidence).toEqual(["skills[0]"]);
  });

  it("does not infer missing skills as not met", () => {
    const result = classifyJobRelevance(candidate(), job([requirement("skill", "Python")]));
    expect(result.classification).toBe("unclassified");
    expect(result.requirements[0].outcome).toBe("cant_tell");
  });

  it("keeps an empty work history unknown", () => {
    const result = classifyJobRelevance(candidate({ employment: [], knownEmploymentMonths: 0 }), job([requirement("experience", "5 years")]));
    expect(result.requirements[0].outcome).toBe("cant_tell");
  });

  it("returns partially relevant when a positive match coexists with an unmet mandatory requirement", () => {
    const result = classifyJobRelevance(candidate(), job([
      requirement("skill", "TypeScript"),
      requirement("experience", "5 years"),
    ]));
    expect(result.classification).toBe("partially_relevant");
    expect(result.requirements[1].outcome).toBe("not_met");
  });

  it("does not classify unavailable extraction", () => {
    const result = classifyJobRelevance(candidate(), job([]));
    expect(result.classification).toBe("unclassified");
  });
});
