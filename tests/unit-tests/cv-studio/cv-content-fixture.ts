import { cvContentSchema } from "@/thungatha-features/cv-studio/server/cv-studio-schema";

export const content = cvContentSchema.parse({
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
      achievements: ["Original achievement."],
    },
  ],
  projects: [
    {
      sourceId: "project-1",
      name: "Project",
      role: null,
      description: "Original project description.",
      url: null,
    },
  ],
  technicalSkills: ["TypeScript"],
  education: [],
  certifications: [],
  languages: [],
});
