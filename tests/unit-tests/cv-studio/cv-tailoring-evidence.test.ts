import { describe, expect, it } from "vitest";
import { createEvidence, master } from "./cv-tailoring-test-fixtures";

describe("CV tailoring evidence", () => {
  it("exposes factual CV evidence and exact editable source targets", () => {
    const result = createEvidence();
    expect(result.profileEvidence).toContainEqual({
      id: "cv:workExperience[work-1].employer",
      content: "Example Ltd",
    });
    expect(result.editableTargets).toContainEqual({
      path: "workExperience[work-1].description",
      currentText: "Built internal web applications.",
      profileEvidenceRef: "cv:workExperience[work-1].description",
    });
    expect(result.editableTargets.some((item) => item.path === "email")).toBe(
      false,
    );
  });

  it("preserves source evidence excerpts", () => {
    const result = createEvidence();
    expect(
      result.profileEvidence.find(
        (item) => item.id === "cv:professionalSummary",
      )?.content,
    ).toBe("Builds web applications with React and TypeScript.");
    expect(
      result.profileEvidence.find(
        (item) => item.id === "cv:workExperience[work-1].description",
      )?.content,
    ).toBe("Built internal web applications.");
  });

  it("uses current draft text as the target baseline, not as evidence", () => {
    const draft = {
      ...master,
      professionalSummary: "My manually edited draft.",
    };
    const result = createEvidence(draft);
    expect(result.profileEvidence).toContainEqual({
      id: "cv:professionalSummary",
      content: master.professionalSummary,
    });
    expect(result.editableTargets).toContainEqual({
      path: "professionalSummary",
      currentText: "My manually edited draft.",
      profileEvidenceRef: "cv:professionalSummary",
    });
  });
});
