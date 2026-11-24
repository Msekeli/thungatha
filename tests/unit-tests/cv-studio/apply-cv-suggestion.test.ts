import { describe, expect, it } from "vitest";
import { applyCvSuggestion } from "@/thungatha-features/cv-studio/server/apply-cv-suggestion";
import { cvContentSchema, cvSuggestionSchema } from "@/thungatha-features/cv-studio/server/cv-studio-schema";

const content = cvContentSchema.parse({
  fullName: "Candidate",
  headline: "Developer",
  email: "candidate@example.com",
  phone: null,
  location: null,
  linkedinUrl: null,
  portfolioUrl: null,
  professionalSummary: "Original summary.",
  workExperience: [{
    sourceId: "work-1",
    jobTitle: "Developer",
    employer: "Example",
    location: null,
    startDate: "2022-01",
    endDate: null,
    isCurrent: true,
    description: "Original description.",
    achievements: ["Original achievement."],
  }],
  projects: [{
    sourceId: "project-1",
    name: "Project",
    role: null,
    description: "Original project description.",
    url: null,
  }],
  technicalSkills: ["TypeScript"],
  education: [],
  certifications: [],
  languages: [],
});

function suggestion(targetPath: string) {
  return cvSuggestionSchema.parse({
    id: "2a89e55e-40cc-4d0f-9c1a-2f735e917db7",
    targetPath,
    originalText: "Original description.",
    proposedText: "Revised evidence-grounded description.",
    reason: "Makes the existing work clearer.",
    evidenceRefs: ["cv:workExperience[work-1].description", "job:description:0"],
    evidence: [
      { ref: "cv:workExperience[work-1].description", source: "profile", excerpt: "Built internal web applications." },
      { ref: "job:description:0", source: "job", excerpt: "Build internal applications." },
    ],
    decision: "accepted",
  });
}

describe("applyCvSuggestion", () => {
  it("updates only the approved work-description target", () => {
    const result = applyCvSuggestion(
      content,
      suggestion("workExperience[work-1].description"),
    );
    expect(result.workExperience[0].description).toBe(
      "Revised evidence-grounded description.",
    );
    expect(result.fullName).toBe(content.fullName);
    expect(content.workExperience[0].description).toBe("Original description.");
  });

  it("does not overwrite text changed after the suggestion was generated", () => {
    const edited = { ...content, professionalSummary: "User's newer edit." };
    expect(() => applyCvSuggestion(
      edited,
      suggestion("professionalSummary"),
    )).toThrow(/stale/);
  });

  it("rejects fields outside the editable target contract", () => {
    expect(() => applyCvSuggestion(content, suggestion("email"))).toThrow(
      /unsupported field/,
    );
  });
});
