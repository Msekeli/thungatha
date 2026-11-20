import { describe, expect, it } from "vitest";
import { classifyJobRelevance, type CandidateFacts } from "@/thungatha-features/job-discovery/server/relevance-classifier";
import { jobRequirementsSchema } from "@/thungatha-features/job-discovery/server/job-requirement-schema";

const candidate = {
  profileVersion: 1, confirmedAt: "2026-11-20T00:00:00Z", nextRole: null,
  skills: [{ value: "TypeScript", canonical: "TypeScript", sourcePath: "skills[0]" }],
  education: [], certifications: [], languages: [],
  employment: [{ id: "1", jobTitle: "Developer", employer: "Example", startMonth: 24000, endMonth: 24035, sourcePath: "workExperience[0]" }],
  knownEmploymentMonths: 36, unknownEmploymentSourcePaths: [],
} as CandidateFacts;

function classify(importance: "mandatory" | "preferred", status: "complete" | "partial") {
  return classifyJobRelevance(candidate, jobRequirementsSchema.parse({
    schemaVersion: 1, extractionVersion: "m3-c02-v2", descriptionHash: "b".repeat(64),
    roleFamily: null, status,
    requirements: [
      { id: "skill-1", category: "skill", value: "TypeScript", importance: "mandatory", sourceText: "TypeScript", confidence: "explicit" },
      { id: "experience-1", category: "experience", value: "5 years", importance, sourceText: "5 years experience", confidence: "explicit" },
    ],
  })).classification;
}

describe("relevance classification boundaries", () => {
  it("does not let an unmet preferred requirement override relevant mandatory evidence", () => {
    expect(classify("preferred", "complete")).toBe("relevant");
  });

  it("keeps a partial extraction unclassified when only an unmet preferred requirement exists", () => {
    expect(classify("preferred", "partial")).toBe("unclassified");
  });
});
