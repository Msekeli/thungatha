import { describe, expect, it } from "vitest";
import { buildCvTailoringEvidence } from "@/thungatha-features/cv-studio/server/cv-tailoring-evidence";
import { cvContentSchema } from "@/thungatha-features/cv-studio/server/cv-studio-schema";
import { mapCvTailoringOutput } from "@/thungatha-features/cv-studio/server/map-cv-tailoring-output";
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

const jobEvidence = [
  { id: "job:description:0", content: "Build and maintain React applications." },
  { id: "job:description:1", content: "Participate in code reviews." },
];
const requirements = [
  { id: "req-react", statement: "Experience with React.", sourceEvidenceRefs: ["job:description:0"] },
  { id: "req-reviews", statement: "Experience with code reviews.", sourceEvidenceRefs: ["job:description:1"] },
];

describe("CV tailoring evidence", () => {
  it("exposes only factual CV evidence and binds editable targets to their exact source field", () => {
    const result = buildCvTailoringEvidence(master);
    expect(result.profileEvidence).toContainEqual({
      id: "cv:workExperience[work-1].employer",
      content: "Example Ltd",
    });
    expect(result.editableTargets).toContainEqual({
      path: "workExperience[work-1].description",
      currentText: "Built internal web applications.",
      profileEvidenceRef: "cv:workExperience[work-1].description",
    });
    expect(result.editableTargets.some((item) => item.path === "email")).toBe(false);
  });

  it("preserves the original spacing in source evidence excerpts", () => {
    const result = buildCvTailoringEvidence(master);
    expect(result.profileEvidence.find((item) => item.id === "cv:professionalSummary")?.content)
      .toBe("Builds web applications with React and TypeScript.");
    expect(result.profileEvidence.find((item) => item.id === "cv:workExperience[work-1].description")?.content)
      .toBe("Built internal web applications.");
  });

  it("converts the response contract to Gemini-compatible structured schema", () => {
    const evidence = buildCvTailoringEvidence(master);
    const result = createCvTailoringResponseSchema(
      evidence.profileEvidence.map((item) => item.id),
      jobEvidence.map((item) => item.id),
      evidence.editableTargets.map((item) => item.path),
      requirements.map((item) => item.id),
    );
    expect(result.responseSchema.type).toBe("OBJECT");
    const properties = result.responseSchema.properties as Record<string, unknown>;
    const suggestions = properties.suggestions as {
      items: { properties: Record<string, { nullable?: boolean; type?: string }> };
    };
    const suggestion = suggestions.items.properties;
    expect(suggestion.originalText.nullable).toBe(true);
    expect(suggestion.targetPath.type).toBe("STRING");
    expect(suggestion.requirementIds.type).toBe("ARRAY");
  });

  it("uses the current draft text as the suggestion baseline, not as evidence", () => {
    const currentDraft = { ...master, professionalSummary: "My manually edited draft." };
    const result = buildCvTailoringEvidence(master, currentDraft);
    expect(result.profileEvidence).toContainEqual({
      id: "cv:professionalSummary",
      content: "Builds web applications with React and TypeScript.",
    });
    expect(result.editableTargets).toContainEqual({
      path: "professionalSummary",
      currentText: "My manually edited draft.",
      profileEvidenceRef: "cv:professionalSummary",
    });
  });

  it("rejects model references outside the supplied evidence and editable paths", () => {
    const evidence = buildCvTailoringEvidence(master);
    const schema = createCvTailoringResponseSchema(
      evidence.profileEvidence.map((item) => item.id),
      jobEvidence.map((item) => item.id),
      evidence.editableTargets.map((item) => item.path),
      requirements.map((item) => item.id),
    );
    expect(() => schema.validator.parse({
      suggestions: [{
        targetPath: "email",
        originalText: "candidate@example.com",
        proposedText: "new@example.com",
        reason: "Improve contact details.",
        profileEvidenceRefs: ["cv:headline"],
        requirementIds: ["req-react"],
        jobEvidenceRefs: ["job:description:0"],
      }],
      gaps: [],
    })).toThrow();
  });

  it("rejects a valid but unrelated CV evidence reference for the edited field", () => {
    const evidence = buildCvTailoringEvidence(master);
    const schema = createCvTailoringResponseSchema(
      evidence.profileEvidence.map((item) => item.id),
      jobEvidence.map((item) => item.id),
      evidence.editableTargets.map((item) => item.path),
      requirements.map((item) => item.id),
    );
    const parsed = schema.validator.parse({
      suggestions: [{
        targetPath: "workExperience[work-1].achievements[0]",
        originalText: "Improved release workflows.",
        proposedText: "Improved release workflows for engineering teams.",
        reason: "Highlights delivery improvements.",
        profileEvidenceRefs: ["cv:workExperience[work-1].employer"],
        requirementIds: ["req-react"],
        jobEvidenceRefs: ["job:description:0"],
      }],
      gaps: [],
    });
    expect(() => mapCvTailoringOutput(
      parsed,
      evidence.profileEvidence,
      jobEvidence,
      evidence.editableTargets,
      requirements,
    )).toThrow(/exact source evidence/);
  });

  it("rejects job evidence not attached to the cited requirement", () => {
    const evidence = buildCvTailoringEvidence(master);
    const schema = createCvTailoringResponseSchema(
      evidence.profileEvidence.map((item) => item.id),
      jobEvidence.map((item) => item.id),
      evidence.editableTargets.map((item) => item.path),
      requirements.map((item) => item.id),
    );
    const parsed = schema.validator.parse({
      suggestions: [{
        targetPath: "workExperience[work-1].description",
        originalText: "Built internal web applications.",
        proposedText: "Built internal web applications with React.",
        reason: "Aligns existing frontend work to the role.",
        profileEvidenceRefs: ["cv:workExperience[work-1].description"],
        requirementIds: ["req-react"],
        jobEvidenceRefs: ["job:description:1"],
      }],
      gaps: [],
    });
    expect(() => mapCvTailoringOutput(
      parsed,
      evidence.profileEvidence,
      jobEvidence,
      evidence.editableTargets,
      requirements,
    )).toThrow(/not attached to its selected requirement/);
  });

  it("accepts a proposal only when exact field evidence and matching requirement evidence are cited", () => {
    const evidence = buildCvTailoringEvidence(master);
    const schema = createCvTailoringResponseSchema(
      evidence.profileEvidence.map((item) => item.id),
      jobEvidence.map((item) => item.id),
      evidence.editableTargets.map((item) => item.path),
      requirements.map((item) => item.id),
    );
    const parsed = schema.validator.parse({
      suggestions: [{
        targetPath: "workExperience[work-1].description",
        originalText: "Built internal web applications.",
        proposedText: "Built internal web applications using React.",
        reason: "Connects the existing application work to the stated React requirement.",
        profileEvidenceRefs: ["cv:workExperience[work-1].description"],
        requirementIds: ["req-react"],
        jobEvidenceRefs: ["job:description:0"],
      }],
      gaps: [],
    });
    const mapped = mapCvTailoringOutput(
      parsed,
      evidence.profileEvidence,
      jobEvidence,
      evidence.editableTargets,
      requirements,
    );
    expect(mapped.suggestions).toHaveLength(1);
    expect(mapped.suggestions[0].evidence.map((item) => item.ref)).toEqual([
      "cv:workExperience[work-1].description",
      "job:description:0",
    ]);
  });
});
