import { z } from "zod";

const optionalText = z.string().trim().min(1).nullable();

const nullableUrl = z.string().url().nullable();

const nullableDate = z.string().datetime({ offset: true }).nullable();

export const jobSourceKindSchema = z.enum([
  "aggregator",
  "ats",
  "employer_site",
  "feed",
]);

export const jobWorkModeSchema = z.enum([
  "onsite",
  "hybrid",
  "remote",
  "unknown",
]);

export const normalizedJobSchema = z
  .object({
    providerKey: z.string().trim().min(1),
    providerKind: jobSourceKindSchema,
    externalJobId: z.string().trim().min(1),
    upstreamSource: optionalText.default(null),
    title: z.string().trim().min(1),
    employerName: optionalText,
    description: optionalText,
    locationText: optionalText,
    countryCode: z
      .string()
      .regex(/^[A-Z]{2}$/)
      .nullable(),

    workMode: jobWorkModeSchema,
    employmentType: optionalText,

    salaryMin: z.number().finite().nonnegative().nullable(),
    salaryMax: z.number().finite().nonnegative().nullable(),
    salaryCurrency: z
      .string()
      .regex(/^[A-Z]{3}$/)
      .nullable(),

    publishedAt: nullableDate,
    sourceUrl: nullableUrl,
    applicationUrl: nullableUrl,
  })
  .strict()
  .refine(
    (job) =>
      job.salaryMin === null ||
      job.salaryMax === null ||
      job.salaryMin <= job.salaryMax,
    {
      message: "Minimum salary cannot exceed maximum salary.",
      path: ["salaryMin"],
    },
  );

export type NormalizedJob = z.infer<typeof normalizedJobSchema>;

export const jobSearchQuerySchema = z
  .object({
    query: z.string().trim().max(200).optional(),
    location: z.string().trim().max(200).optional(),
    countryCode: z
      .string()
      .regex(/^[A-Z]{2}$/)
      .optional(),
    page: z.number().int().min(1).max(100).default(1),
    pageSize: z.number().int().min(1).max(100).default(25),
  })
  .strict();

export type JobSearchQuery = z.infer<typeof jobSearchQuerySchema>;
