import { buildCvTailoringEvidence } from "@/thungatha-features/cv-studio/server/cv-tailoring-evidence";
import { cvContentSchema } from "@/thungatha-features/cv-studio/server/cv-studio-schema";
import { createCvTailoringResponseSchema } from "@/thungatha-features/cv-studio/server/cv-tailoring-schema";

export const master = cvContentSchema.parse({
  fullName: "Candidate",
  headline: "Software Developer",
  email: "candidate@example.com",
  phone: null,
  location: null,
  linkedinUrl: null,
  portfolioUrl: null,
  professionalSummary: "Builds web applications with React and TypeScript.",
  workExperience: [{
    sourceId: "work-1", jobTitle: "Developer", employer: "Example Ltd",
    location: null, startDate: "2022-01", endDate: null, isCurrent: true,
    description: "Built internal web applications.",
    achievements: ["Improved release workflows."],
  }],
  projects: [],
  technicalSkills: ["React", "TypeScript"],
  education: [],
  certifications: [],
  languages: ["English"],
});

export const jobEvidence = [
  { id: "job:description:0", content: "Build and maintain React applications." },
  { id: "job:description:1", content: "Participate in code reviews." },
];

export const requirements = [
  { id: "req-react", statement: "Experience with React.", sourceEvidenceRefs: ["job:description:0"] },
  { id: "req-reviews", statement: "Experience with code reviews.", sourceEvidenceRefs: ["job:description:1"] },
];

export const createEvidence = (currentDraft = master) =>
  buildCvTailoringEvidence(master, currentDraft);

export function createSchema(
  evidence = createEvidence(),
  requirementIds = requirements.map((item) => item.id),
) {
  return createCvTailoringResponseSchema(
    evidence.profileEvidence.map((item) => item.id),
    jobEvidence.map((item) => item.id),
    evidence.editableTargets.map((item) => item.path),
    requirementIds,
  );
}
