import { describe, expect, it } from "vitest";
import { mapCvSectionTailoringOutput } from "@/thungatha-features/cv-studio/server/map-cv-tailoring-output";
import {
  createContract, jobRef, profileRef, requirementId, targetPath,
} from "./cv-section-tailoring-fixtures";

describe("work experience section tailoring mapper", () => {
  it("maps proposals for the supplied experience target only", () => {
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
});
