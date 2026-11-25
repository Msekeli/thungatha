import { describe, expect, it } from "vitest";
import { createCvSectionTailoringResponseSchema } from "@/thungatha-features/cv-studio/server/cv-tailoring-schema";
import { mapCvSectionTailoringOutput } from "@/thungatha-features/cv-studio/server/map-cv-tailoring-output";

const profileRef = "cv:workExperience[experience-1].description";
const jobRef = "job:segment:4";
const targetPath = "workExperience[experience-1].description";
const requirementId = "requirement-1";

function createContract() {
  return createCvSectionTailoringResponseSchema(
    [profileRef],
    [jobRef],
    [targetPath],
    [requirementId],
  );
}

describe("work experience section tailoring contract", () => {
  it("accepts proposals for the supplied experience target only", () => {
    const parsed = createContract().validator.parse({
      suggestions: [{
        targetPath,
        originalText: "Maintained internal applications.",
        proposedText: "Maintained internal applications using C# and SQL Server.",
        reason: "This experience directly supports the role's application development requirement.",
        profileEvidenceRefs: [profileRef],
        requirementIds: [requirementId],
        jobEvidenceRefs: [jobRef],
      }],
    });

    const mapped = mapCvSectionTailoringOutput(
      parsed,
      [{ id: profileRef, content: "Maintained internal applications." }],
      [{ id: jobRef, content: "Build and maintain internal applications." }],
      [{
        path: targetPath,
        currentText: "Maintained internal applications.",
        profileEvidenceRef: profileRef,
      }],
      [{
        id: requirementId,
        statement: "Application development experience.",
        sourceEvidenceRefs: [jobRef],
      }],
    );

    expect(mapped.suggestions).toHaveLength(1);
    expect(mapped.suggestions[0]).toMatchObject({
      targetPath,
      originalText: "Maintained internal applications.",
      proposedText: "Maintained internal applications using C# and SQL Server.",
      decision: "pending",
      evidenceRefs: [profileRef, jobRef],
    });
  });

  it("rejects targets belonging to another employer", () => {
    const result = createContract().validator.safeParse({
      suggestions: [{
        targetPath: "workExperience[experience-2].description",
        originalText: "Other employer text.",
        proposedText: "Changed text.",
        reason: "Relevant.",
        profileEvidenceRefs: [profileRef],
        requirementIds: [requirementId],
        jobEvidenceRefs: [jobRef],
      }],
    });

    expect(result.success).toBe(false);
  });

  it("rejects unknown Profile and job evidence references", () => {
    const result = createContract().validator.safeParse({
      suggestions: [{
        targetPath,
        originalText: "Maintained internal applications.",
        proposedText: "Changed text.",
        reason: "Relevant.",
        profileEvidenceRefs: ["cv:workExperience[other].description"],
        requirementIds: [requirementId],
        jobEvidenceRefs: ["job:segment:99"],
      }],
    });

    expect(result.success).toBe(false);
  });

  it("does not accept a whole-CV requirement assessment in a section response", () => {
    const result = createContract().validator.safeParse({
      suggestions: [],
      coveredRequirementIds: [requirementId],
      gaps: [],
    });

    expect(result.success).toBe(false);
  });
});
