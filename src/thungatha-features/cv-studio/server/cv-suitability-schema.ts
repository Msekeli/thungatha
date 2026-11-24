import { z } from "zod";
import { cvJobContextSchema } from "./job-context-schema";

export const cvSuitabilityInputSchema = z
  .object({
    masterVersionId: z.string().uuid(),
    jobContext: cvJobContextSchema,
  })
  .strict();

export const cvSuitabilityResponseSchema = z
  .object({
    status: z.enum([
      "existing_version_found",
      "new_version_recommended",
      "assessment_unavailable",
    ]),
    masterVersionId: z.string().uuid(),
    sourceProfileVersion: z.number().int().positive(),
    matchingVersions: z.array(
      z
        .object({
          id: z.string().uuid(),
          versionNumber: z.number().int().positive(),
          updatedAt: z.string().datetime({ offset: true }),
          accentColour: z.enum(["teal", "navy", "burgundy", "forest"]),
        })
        .strict(),
    ),
    recommendation: z.enum([
      "reuse_existing",
      "prepare_new_draft",
      "review_manually",
    ]),
    explanation: z.string().min(1).max(1000),
    semanticAssessment: z.literal("unavailable"),
  })
  .strict();

export type CvSuitabilityInput = z.infer<typeof cvSuitabilityInputSchema>;
