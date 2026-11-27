import { describe, expect, it } from "vitest";
import {
  createContract,
  jobRef,
  profileRef,
  requirementId,
  targetPath,
} from "./cv-section-tailoring-fixtures";

describe("work experience section tailoring contract", () => {
  it("rejects targets belonging to another employer", () => {
    const result = createContract().validator.safeParse({
      suggestions: [
        {
          targetPath: "workExperience[experience-2].description",
          originalText: "Other employer text.",
          proposedText: "Changed text.",
          reason: "Relevant.",
          profileEvidenceRefs: [profileRef],
          requirementIds: [requirementId],
          jobEvidenceRefs: [jobRef],
        },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("rejects unknown Profile and job evidence references", () => {
    const result = createContract().validator.safeParse({
      suggestions: [
        {
          targetPath,
          originalText: "Maintained internal applications.",
          proposedText: "Changed text.",
          reason: "Relevant.",
          profileEvidenceRefs: ["cv:workExperience[other].description"],
          requirementIds: [requirementId],
          jobEvidenceRefs: ["job:segment:99"],
        },
      ],
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
