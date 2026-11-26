import { describe, expect, it } from "vitest";
import { applyCvSuggestion } from "@/thungatha-features/cv-studio/server/apply-cv-suggestion";
import { content } from "./cv-content-fixture";
import {
  createSuggestion,
  createSummarySuggestion,
} from "./cv-suggestion-fixtures";

describe("applyCvSuggestion", () => {
  it("updates only the approved work-description target", () => {
    const result = applyCvSuggestion(
      content,
      createSuggestion("workExperience[work-1].description"),
    );
    expect(result.workExperience[0].description)
      .toBe("Revised evidence-grounded description.");
    expect(result.fullName).toBe(content.fullName);
    expect(content.workExperience[0].description).toBe("Original description.");
  });

  it("applies a professional-summary proposal without mutating the source", () => {
    const summarySuggestion = createSummarySuggestion();
    const result = applyCvSuggestion(content, summarySuggestion);
    expect(result.professionalSummary).toBe(summarySuggestion.proposedText);
    expect(content.professionalSummary).toBe("Original summary.");
    expect(result.technicalSkills).toEqual(content.technicalSkills);
  });

  it("does not overwrite text changed after the suggestion was generated", () => {
    const edited = { ...content, professionalSummary: "User's newer edit." };
    expect(() => applyCvSuggestion(
      edited, createSuggestion("professionalSummary"),
    )).toThrow(/stale/);
  });

  it("rejects fields outside the editable target contract", () => {
    expect(() => applyCvSuggestion(content, createSuggestion("email")))
      .toThrow(/unsupported field/);
  });
});
