import { z } from "zod";
import { toGeminiResponseSchema } from "./job-ai-gemini-schema";

function evidenceEnum(values: string[]) {
  const unique = [...new Set(values)];
  return unique.length
    ? z.enum(unique as [string, ...string[]])
    : z.string().min(1);
}

// Constrain evidence IDs at generation time as well as validating them after generation.
export function createMatchAssessmentResponseSchema(
  jobEvidenceIds: string[],
  profileEvidenceIds: string[],
  requirementIds: string[],
) {
  const jobRef = evidenceEnum(jobEvidenceIds);
  const profileRef = evidenceEnum(profileEvidenceIds);
  const requirementId = evidenceEnum(requirementIds);
  const modelSchema = z.object({
    semanticAlignment: z.object({
      level: z.enum(["strong", "meaningful", "insufficient"]),
      materialGaps: z.boolean(),
      jobEvidenceRefs: z.array(jobRef).min(1),
      profileEvidenceRefs: z.array(profileRef),
    }),
    summary: z.string().min(1),
    alignmentExplanation: z.string().min(1),
    requirements: z.array(
      z.object({
        id: requirementId,
        assessment: z.enum([
          "supported",
          "not_demonstrated",
          "contradictory",
          "uncertain",
        ]),
        explanation: z.string().min(1),
        jobEvidenceRefs: z.array(jobRef).min(1),
        profileEvidenceRefs: z.array(profileRef),
      }),
    ),
    gaps: z.array(
      z.object({
        description: z.string().min(1),
        jobEvidenceRefs: z.array(jobRef).min(1),
        profileEvidenceRefs: z.array(profileRef),
      }),
    ),
  });
  return {
    validator: modelSchema,
    responseSchema: toGeminiResponseSchema(modelSchema),
  };
}

export type MatchAssessmentModelOutput = z.infer<
  ReturnType<typeof createMatchAssessmentResponseSchema>["validator"]
>;
