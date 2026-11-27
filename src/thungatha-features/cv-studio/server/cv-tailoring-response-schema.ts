import { z } from "zod";
import { toGeminiResponseSchema } from "./cv-tailoring-gemini-schema";
import {
  checkReferences,
  checkRequirementCoverage,
} from "./cv-tailoring-schema-validation";

const evidenceRef = () => z.string().min(1);

export function createCvTailoringResponseSchema(
  profileEvidenceIds: string[],
  jobEvidenceIds: string[],
  targetPaths: string[],
  requirementIds: string[],
) {
  const allowedProfileRefs = new Set(profileEvidenceIds);
  const allowedJobRefs = new Set(jobEvidenceIds);
  const allowedTargetPaths = new Set(targetPaths);
  const allowedRequirementIds = new Set(requirementIds);
  const validator = z
    .object({
      suggestions: z.array(
        z
          .object({
            targetPath: evidenceRef(),
            originalText: z.string().nullable(),
            proposedText: z.string().min(1),
            reason: z.string().min(1),
            profileEvidenceRefs: z.array(evidenceRef()).min(1),
            requirementIds: z.array(evidenceRef()),
            jobEvidenceRefs: z.array(evidenceRef()).min(1),
          })
          .strict(),
      ),
      coveredRequirementIds: z.array(evidenceRef()),
      gaps: z.array(
        z
          .object({
            requirementId: evidenceRef(),
            explanation: z.string().min(1),
            jobEvidenceRefs: z.array(evidenceRef()).min(1),
          })
          .strict(),
      ),
    })
    .strict()
    .superRefine((output, context) => {
      output.suggestions.forEach((suggestion, index) => {
        if (!allowedTargetPaths.has(suggestion.targetPath)) {
          context.addIssue({
            code: "custom",
            path: ["suggestions", index, "targetPath"],
            message: "Unknown editable target path.",
          });
        }
        checkReferences(
          suggestion.profileEvidenceRefs,
          allowedProfileRefs,
          ["suggestions", index, "profileEvidenceRefs"],
          "profile evidence",
          context,
        );
        checkReferences(
          suggestion.jobEvidenceRefs,
          allowedJobRefs,
          ["suggestions", index, "jobEvidenceRefs"],
          "job evidence",
          context,
        );
        checkReferences(
          suggestion.requirementIds,
          allowedRequirementIds,
          ["suggestions", index, "requirementIds"],
          "requirement",
          context,
        );
      });
      checkReferences(
        output.coveredRequirementIds,
        allowedRequirementIds,
        ["coveredRequirementIds"],
        "requirement",
        context,
      );
      output.gaps.forEach((gap, index) => {
        if (!allowedRequirementIds.has(gap.requirementId)) {
          context.addIssue({
            code: "custom",
            path: ["gaps", index, "requirementId"],
            message: "Unknown requirement reference.",
          });
        }
        checkReferences(
          gap.jobEvidenceRefs,
          allowedJobRefs,
          ["gaps", index, "jobEvidenceRefs"],
          "job evidence",
          context,
        );
      });
      if (requirementIds.length === 0 && output.suggestions.length > 0) {
        context.addIssue({
          code: "custom",
          path: ["suggestions"],
          message:
            "Suggestions cannot be generated without an extracted job requirement to justify relevance.",
        });
      }
      checkRequirementCoverage(
        output.coveredRequirementIds,
        output.gaps.map((gap) => gap.requirementId),
        requirementIds,
        context,
      );
    });
  return { validator, responseSchema: toGeminiResponseSchema(validator) };
}
