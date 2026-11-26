import { z } from "zod";
import { toGeminiResponseSchema } from "./cv-tailoring-gemini-schema";

const evidenceRef = () => z.string().min(1);

export function createCvSectionTailoringResponseSchema(
  profileEvidenceIds: string[],
  jobEvidenceIds: string[],
  targetPaths: string[],
  requirementIds: string[],
) {
  const allowedProfileRefs = new Set(profileEvidenceIds);
  const allowedJobRefs = new Set(jobEvidenceIds);
  const allowedTargetPaths = new Set(targetPaths);
  const allowedRequirementIds = new Set(requirementIds);
  const validator = z.object({
    suggestions: z.array(z.object({
      targetPath: evidenceRef(),
      originalText: z.string().nullable(),
      proposedText: z.string().min(1),
      reason: z.string().min(1),
      profileEvidenceRefs: z.array(evidenceRef()).min(1),
      requirementIds: z.array(evidenceRef()).min(1),
      jobEvidenceRefs: z.array(evidenceRef()).min(1),
    }).strict()),
  }).strict().superRefine((output, context) => {
    const seenTargets = new Set<string>();
    output.suggestions.forEach((suggestion, index) => {
      if (!allowedTargetPaths.has(suggestion.targetPath)) {
        context.addIssue({
          code: "custom",
          path: ["suggestions", index, "targetPath"],
          message: "Unknown editable target path.",
        });
      }
      if (seenTargets.has(suggestion.targetPath)) {
        context.addIssue({
          code: "custom",
          path: ["suggestions", index, "targetPath"],
          message: "Only one suggestion is allowed per editable field.",
        });
      }
      seenTargets.add(suggestion.targetPath);
      suggestion.profileEvidenceRefs.forEach((ref, refIndex) => {
        if (!allowedProfileRefs.has(ref)) {
          context.addIssue({
            code: "custom",
            path: ["suggestions", index, "profileEvidenceRefs", refIndex],
            message: "Unknown Profile evidence reference.",
          });
        }
      });
      suggestion.jobEvidenceRefs.forEach((ref, refIndex) => {
        if (!allowedJobRefs.has(ref)) {
          context.addIssue({
            code: "custom",
            path: ["suggestions", index, "jobEvidenceRefs", refIndex],
            message: "Unknown job evidence reference.",
          });
        }
      });
      suggestion.requirementIds.forEach((id, refIndex) => {
        if (!allowedRequirementIds.has(id)) {
          context.addIssue({
            code: "custom",
            path: ["suggestions", index, "requirementIds", refIndex],
            message: "Unknown job requirement.",
          });
        }
      });
    });
  });
  return { validator, responseSchema: toGeminiResponseSchema(validator) };
}
