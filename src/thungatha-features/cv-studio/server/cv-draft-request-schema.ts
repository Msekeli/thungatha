import { z } from "zod";
import {
  cvContentSchema,
  cvSuggestionSchema,
  cvAccentColourSchema,
} from "@/thungatha-features/cv-studio/server/cv-studio-schema";
import { cvJobContextSchema } from "@/thungatha-features/cv-studio/server/job-context-schema";

export const createCvDraftSchema = z.object({
  masterVersionId: z.string().uuid(),
  jobContext: cvJobContextSchema,
}).strict();

export const updateCvDraftSchema = z.object({
  id: z.string().uuid(),
  content: cvContentSchema,
  suggestions: z.array(cvSuggestionSchema).max(200),
  accentColour: cvAccentColourSchema,
}).strict();
