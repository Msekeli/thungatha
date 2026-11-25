import { z } from "zod";
import {
  cvCertificationSchema,
  cvEducationSchema,
  cvProjectSchema,
  cvWorkExperienceSchema,
} from "./cv-content-entry-schemas";

const text = (max: number) => z.string().trim().max(max);

export const cvAccentColourSchema = z.enum([
  "teal", "navy", "burgundy", "forest",
]);

/** Structured, template-independent content. The renderer owns layout and typography. */
export const cvContentSchema = z.object({
  fullName: text(150).min(1),
  headline: text(150).nullable(),
  email: z.string().email().max(255),
  phone: text(50).nullable(),
  location: text(300).nullable(),
  linkedinUrl: text(255).nullable(),
  portfolioUrl: text(255).nullable(),
  professionalSummary: text(5000).min(1),
  workExperience: z.array(cvWorkExperienceSchema).max(100),
  projects: z.array(cvProjectSchema).max(100),
  technicalSkills: z.array(text(50).min(1)).max(100),
  education: z.array(cvEducationSchema).max(100),
  certifications: z.array(cvCertificationSchema).max(100),
  languages: z.array(text(100).min(1)).max(100),
}).strict();

export type CvAccentColour = z.infer<typeof cvAccentColourSchema>;
export type CvContent = z.infer<typeof cvContentSchema>;
