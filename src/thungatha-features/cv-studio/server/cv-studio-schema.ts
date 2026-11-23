import { z } from "zod";

const text = (max: number) => z.string().trim().max(max);

export const cvAccentColourSchema = z.enum([
  "teal",
  "navy",
  "burgundy",
  "forest",
]);

export const cvWorkExperienceSchema = z.object({
  sourceId: z.string().min(1).max(100),
  jobTitle: text(150).min(1),
  employer: text(150).min(1),
  location: text(150).nullable(),
  startDate: text(50).min(1),
  endDate: text(50).nullable(),
  isCurrent: z.boolean(),
  description: text(5000).nullable(),
  achievements: z.array(text(1000).min(1)).max(50),
}).strict();

export const cvEducationSchema = z.object({
  sourceId: z.string().min(1).max(100),
  educationLevel: text(100).nullable(),
  qualification: text(150).min(1),
  institution: text(150).min(1),
  fieldOfStudy: text(150).nullable(),
  startDate: text(50).nullable(),
  endDate: text(50).nullable(),
  isCurrent: z.boolean(),
}).strict();

export const cvCertificationSchema = z.object({
  sourceId: z.string().min(1).max(150),
  type: z.enum([
    "professional-certification",
    "occupational-certificate",
    "professional-licence",
    "drivers-licence",
    "other",
  ]).nullable(),
  name: text(150).min(1),
  issuer: text(150).nullable(),
  issueDate: text(50).nullable(),
  expiryDate: text(50).nullable(),
  issuingCountry: text(100).nullable(),
  licenceCategories: z.array(text(30)).max(20),
  endorsements: text(500).nullable(),
}).strict();

export const cvProjectSchema = z.object({
  sourceId: z.string().min(1).max(100),
  name: text(150).min(1),
  role: text(150).nullable(),
  description: text(5000).nullable(),
  url: text(255).nullable(),
}).strict();

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

export const cvSuggestionDecisionSchema = z.enum(["pending", "accepted", "rejected"]);

export const cvSuggestionSchema = z.object({
  id: z.string().uuid(),
  targetPath: z.string().trim().min(1).max(300),
  originalText: text(5000).nullable(),
  proposedText: text(5000).min(1),
  reason: text(2000).min(1),
  evidenceRefs: z.array(z.string().trim().min(1).max(300)).min(1).max(50),
  decision: cvSuggestionDecisionSchema,
}).strict();

export const cvSourceJobSnapshotSchema = z.object({
  title: text(300).min(1),
  company: text(300).nullable(),
  location: text(300).nullable(),
  sourceUrl: z.string().url().max(2000).nullable(),
  descriptionFingerprint: z.string().trim().min(1).max(128),
}).strict();

export const cvVersionRecordSchema = z.object({
  id: z.string().uuid(),
  versionNumber: z.number().int().positive(),
  kind: z.enum(["master", "tailored"]),
  status: z.enum(["current", "draft", "accepted", "superseded"]),
  parentVersionId: z.string().uuid().nullable(),
  sourceProfileVersion: z.number().int().positive(),
  sourceJobId: z.string().uuid().nullable(),
  sourceJobSnapshot: cvSourceJobSnapshotSchema.nullable(),
  content: cvContentSchema,
  suggestions: z.array(cvSuggestionSchema),
  templateVersion: z.string().trim().min(1).max(50),
  accentColour: cvAccentColourSchema,
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
  acceptedAt: z.string().datetime({ offset: true }).nullable(),
}).strict().superRefine((version, context) => {
  if (version.kind === "master" && version.status !== "current" && version.status !== "superseded") {
    context.addIssue({ code: "custom", path: ["status"], message: "Master CV versions are generated from Profile and cannot be tailored drafts." });
  }
  if (version.kind === "tailored" && version.status !== "draft" && version.status !== "accepted") {
    context.addIssue({ code: "custom", path: ["status"], message: "Tailored CV versions must be drafts or accepted." });
  }
  if (version.status === "accepted" && !version.acceptedAt) {
    context.addIssue({ code: "custom", path: ["acceptedAt"], message: "Accepted versions require an acceptance timestamp." });
  }
  if (version.kind === "tailored" && !version.sourceJobSnapshot) {
    context.addIssue({ code: "custom", path: ["sourceJobSnapshot"], message: "Tailored versions require a preserved source-job snapshot." });
  }
});

export type CvAccentColour = z.infer<typeof cvAccentColourSchema>;
export type CvContent = z.infer<typeof cvContentSchema>;
export type CvSuggestion = z.infer<typeof cvSuggestionSchema>;
export type CvVersionRecord = z.infer<typeof cvVersionRecordSchema>;
