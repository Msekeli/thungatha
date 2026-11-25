import { z } from "zod";
import { cvAccentColourSchema, cvContentSchema } from "./cv-content-schema";
import { cvSuggestionSchema } from "./cv-suggestion-schema";

const text = (max: number) => z.string().trim().max(max);

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
  if (version.kind === "master" &&
    version.status !== "current" && version.status !== "superseded") {
    context.addIssue({
      code: "custom",
      path: ["status"],
      message: "Master CV versions are generated from Profile and cannot be tailored drafts.",
    });
  }
  if (version.kind === "tailored" &&
    version.status !== "draft" && version.status !== "accepted") {
    context.addIssue({
      code: "custom",
      path: ["status"],
      message: "Tailored CV versions must be drafts or accepted.",
    });
  }
  if (version.status === "accepted" && !version.acceptedAt) {
    context.addIssue({
      code: "custom",
      path: ["acceptedAt"],
      message: "Accepted versions require an acceptance timestamp.",
    });
  }
  if (version.kind === "tailored" && !version.sourceJobSnapshot) {
    context.addIssue({
      code: "custom",
      path: ["sourceJobSnapshot"],
      message: "Tailored versions require a preserved source-job snapshot.",
    });
  }
});

export type CvVersionRecord = z.infer<typeof cvVersionRecordSchema>;
