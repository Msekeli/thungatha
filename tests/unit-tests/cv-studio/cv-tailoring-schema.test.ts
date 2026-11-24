import { describe, expect, it } from "vitest";
import { buildCvTailoringEvidence } from "@/thungatha-features/cv-studio/server/cv-tailoring-evidence";
import { cvContentSchema } from "@/thungatha-features/cv-studio/server/cv-studio-schema";
import { createCvTailoringResponseSchema } from "@/thungatha-features/cv-studio/server/cv-tailoring-schema";

const master = cvContentSchema.parse({
  fullName: "Candidate",
  headline: "Software Developer",
  email: "candidate@example.com",
  phone: null,
  location: null,
  linkedinUrl: null,
  portfolioUrl: null,
  professionalSummary: "Builds web applications with React and TypeScript.",
  workExperience: [{
    sourceId: "work-1",
    jobTitle: "Developer",
    employer: "Example Ltd",
    location: null,
    startDate: "2022-01",
    endDate: null,
    isCurrent: true,
    description: "Built internal web applications.",
    achievements: ["Improved release workflows."],
  }],
  projects: [],
  technicalSkills: ["React", "TypeScript"],
  education: [],
  certifications: [],
  languages: ["English"],
});

describe("CV tailoring evidence", () => {
  it("exposes only factual CV evidence and editable narrative targets", () => {
    const result = buildCvTailoringEvidence(master);
    expect(result.profileEvidence).toContainEqual({
      id: "cv:workExperience[work-1].employer",
      content: "Example Ltd",
    });
    expect(result.editableTargets).toContainEqual({
      path: "workExperience[work-1].description",
      currentText: "Built internal web applications.",
    });
    expect(result.editableTargets.some((item) => item.path === "email")).toBe(false);
  });

  it("rejects model references outside the supplied evidence and editable paths", () => {
    const evidence = buildCvTailoringEvidence(master);
    const schema = createCvTailoringResponseSchema(
      evidence.profileEvidence.map((item) => item.id),
      ["job:description:0"],
      evidence.editableTargets.map((item) => item.path),
    );
    expect(() => schema.validator.parse({
      suggestions: [{
        targetPath: "email",
        originalText: "candidate@example.com",
        proposedText: "new@example.com",
        reason: "Improve contact details.",
        profileEvidenceRefs: ["cv:headline"],
        jobEvidenceRefs: ["job:description:0"],
      }],
      gaps: [],
    })).toThrow();
  });
});
