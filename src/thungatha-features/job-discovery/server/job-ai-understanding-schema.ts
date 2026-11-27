import { z } from "zod";
import { toGeminiResponseSchema } from "./job-ai-gemini-schema";

function createJobUnderstandingSchema(jobEvidenceRef: z.ZodType<string>) {
  return z.object({
    summary: z.string().min(1),
    responsibilities: z.array(
      z.object({
        id: z.string().min(1),
        statement: z.string().min(1),
        sourceEvidenceRefs: z.array(jobEvidenceRef).min(1),
      }),
    ),
    capabilities: z.array(
      z.object({
        id: z.string().min(1),
        name: z.string().min(1),
        context: z.string(),
        sourceEvidenceRefs: z.array(jobEvidenceRef).min(1),
      }),
    ),
    requirements: z.array(
      z.object({
        id: z.string().min(1),
        statement: z.string().min(1),
        category: z.enum([
          "experience",
          "skill",
          "technology",
          "qualification",
          "certification",
          "licence",
          "language",
          "location",
          "work_mode",
          "other",
        ]),
        importance: z.enum(["mandatory", "preferred", "uncertain"]),
        sourceEvidenceRefs: z.array(jobEvidenceRef).min(1),
      }),
    ),
    coverage: z.enum(["complete", "partial", "unavailable"]),
  });
}

export const jobUnderstandingSchema = createJobUnderstandingSchema(
  z.string().min(1),
);
export type JobUnderstanding = z.infer<typeof jobUnderstandingSchema>;

export function createJobUnderstandingResponseSchema() {
  // Exact evidence membership is checked after parsing by parseJobUnderstanding.
  return toGeminiResponseSchema(
    createJobUnderstandingSchema(z.string().min(1)),
  );
}

export const jobUnderstandingResponseSchema = toGeminiResponseSchema(
  jobUnderstandingSchema,
);
