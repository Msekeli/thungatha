import { z } from "zod";

const evidenceRef = (values: string[]) => {
  const unique = [...new Set(values)];
  if (!unique.length) throw new Error("CV tailoring requires source evidence.");
  return z.enum(unique as [string, ...string[]]);
};

export const CV_TAILORING_VERSION = "m4-cv-tailoring-v1";

export function createCvTailoringResponseSchema(
  profileEvidenceIds: string[],
  jobEvidenceIds: string[],
  targetPaths: string[],
) {
  const profileRef = evidenceRef(profileEvidenceIds);
  const jobRef = evidenceRef(jobEvidenceIds);
  const targetPath = evidenceRef(targetPaths);
  const validator = z.object({
    suggestions: z.array(
      z.object({
        targetPath,
        originalText: z.string().nullable(),
        proposedText: z.string().min(1),
        reason: z.string().min(1),
        profileEvidenceRefs: z.array(profileRef).min(1),
        jobEvidenceRefs: z.array(jobRef).min(1),
      }).strict(),
    ),
    gaps: z.array(
      z.object({
        requirement: z.string().min(1),
        explanation: z.string().min(1),
        jobEvidenceRefs: z.array(jobRef).min(1),
      }).strict(),
    ),
  }).strict();

  const responseSchema = z.toJSONSchema(validator, {
    target: "draft-07",
    unrepresentable: "any",
  }) as Record<string, unknown>;

  return { validator, responseSchema };
}

export type CvTailoringModelOutput = z.infer<
  ReturnType<typeof createCvTailoringResponseSchema>["validator"]
>;
