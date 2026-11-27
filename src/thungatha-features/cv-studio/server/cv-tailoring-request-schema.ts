import { z } from "zod";
import { cvJobContextInputSchema } from "./job-context-schema";

export const cvTailoringRequestSchema = z.discriminatedUnion("section", [
  z
    .object({
      section: z.literal("professionalSummary"),
      draftId: z.string().uuid(),
      job: cvJobContextInputSchema,
    })
    .strict(),
  z
    .object({
      section: z.literal("workExperience"),
      draftId: z.string().uuid(),
      experienceSourceId: z.string().trim().min(1).max(100),
      job: cvJobContextInputSchema,
    })
    .strict(),
]);

export type CvTailoringRequest = z.infer<typeof cvTailoringRequestSchema>;
