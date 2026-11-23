import { z } from "zod";

const descriptionSchema = z.string().trim().min(200, "The job description is too short to analyse.").max(30000, "The job description is too long.");

export const cvJobContextInputSchema = z.discriminatedUnion("source", [
  z.object({ source: z.literal("discovery"), jobId: z.string().uuid() }).strict(),
  z.object({
    source: z.literal("pasted"),
    title: z.string().trim().min(2).max(300),
    company: z.string().trim().max(300).nullable().optional(),
    location: z.string().trim().max(300).nullable().optional(),
    description: descriptionSchema,
    sourceUrl: z.string().url().max(2000).refine((value) => ["http:", "https:"].includes(new URL(value).protocol)).nullable().optional(),
  }).strict(),
  z.object({ source: z.literal("url"), url: z.string().url().max(2000) }).strict(),
]);

export type CvJobContextInput = z.infer<typeof cvJobContextInputSchema>;

export const cvJobContextSchema = z.object({
  source: z.enum(["discovery", "pasted"]),
  jobId: z.string().uuid().nullable(),
  title: z.string().min(1).max(300),
  company: z.string().max(300).nullable(),
  location: z.string().max(300).nullable(),
  sourceUrl: z.string().url().nullable(),
  description: descriptionSchema,
  descriptionFingerprint: z.string().length(64),
  retrievedAt: z.string().datetime({ offset: true }),
}).strict();

export type CvJobContext = z.infer<typeof cvJobContextSchema>;
