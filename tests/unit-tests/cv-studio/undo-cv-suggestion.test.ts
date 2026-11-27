import { describe, expect, it } from "vitest";
import {
  applyCvSuggestion,
  undoCvSuggestion,
} from "@/thungatha-features/cv-studio/server/apply-cv-suggestion";
import {
  cvContentSchema,
  cvSuggestionSchema,
} from "@/thungatha-features/cv-studio/server/cv-studio-schema";

const cv = cvContentSchema.parse({
  fullName: "Candidate",
  headline: "Developer",
  email: "candidate@example.com",
  phone: null,
  location: null,
  linkedinUrl: null,
  portfolioUrl: null,
  professionalSummary: "Original summary.",
  workExperience: [
    {
      sourceId: "work-1",
      jobTitle: "Developer",
      employer: "Example",
      location: null,
      startDate: "2022-01",
      endDate: null,
      isCurrent: true,
      description: "Original description.",
      achievements: [],
    },
  ],
  projects: [],
  technicalSkills: [],
  education: [],
  certifications: [],
  languages: [],
});

const suggestion = cvSuggestionSchema.parse({
  id: "2a89e55e-40cc-4d0f-9c1a-2f735e917db7",
  targetPath: "workExperience[work-1].description",
  originalText: "Original description.",
  proposedText: "Revised description.",
  reason: "Clarifies the confirmed work.",
  evidenceRefs: ["cv:work-1", "job:description:0"],
  evidence: [
    { ref: "cv:work-1", source: "profile", excerpt: "Original description." },
    {
      ref: "job:description:0",
      source: "job",
      excerpt: "Relevant role requirement.",
    },
  ],
  decision: "accepted",
});

describe("undoCvSuggestion", () => {
  it("restores the exact original description after an accepted edit", () => {
    const updated = applyCvSuggestion(cv, suggestion);
    const restored = undoCvSuggestion(updated, suggestion);
    expect(restored.workExperience[0].description).toBe(
      "Original description.",
    );
    expect(cv.workExperience[0].description).toBe("Original description.");
  });

  it("refuses to undo after the edited description changes again", () => {
    const updated = applyCvSuggestion(cv, suggestion);
    const changed = {
      ...updated,
      workExperience: [
        {
          ...updated.workExperience[0],
          description: "A later edit.",
        },
      ],
    };
    expect(() => undoCvSuggestion(changed, suggestion)).toThrow(
      /can no longer be undone/,
    );
  });
});
