import { z } from "zod";

const evidenceRef = () => z.string().min(1);

const GEMINI_TYPES: Record<string, string> = {
  object: "OBJECT",
  array: "ARRAY",
  string: "STRING",
  number: "NUMBER",
  integer: "INTEGER",
  boolean: "BOOLEAN",
};

function toGeminiSchemaNode(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const schema = value as Record<string, unknown>;
  if (Array.isArray(schema.anyOf)) {
    const alternatives = schema.anyOf as Record<string, unknown>[];
    const nonNull = alternatives.filter((item) => item.type !== "null");
    if (nonNull.length === 1 && nonNull.length !== alternatives.length) {
      return { ...toGeminiSchemaNode(nonNull[0]), nullable: true };
    }
  }
  const output: Record<string, unknown> = {};
  if (Array.isArray(schema.type)) {
    const types = schema.type.filter(
      (item): item is string => typeof item === "string",
    );
    const nonNullTypes = types.filter((item) => item !== "null");
    if (nonNullTypes.length === 1) {
      output.type =
        GEMINI_TYPES[nonNullTypes[0]] ?? nonNullTypes[0].toUpperCase();
      if (types.includes("null")) output.nullable = true;
    }
  } else if (typeof schema.type === "string") {
    output.type = GEMINI_TYPES[schema.type] ?? schema.type.toUpperCase();
  }
  for (const key of [
    "enum",
    "required",
    "description",
    "format",
    "additionalProperties",
  ]) {
    if (schema[key] !== undefined) output[key] = schema[key];
  }
  if (schema.items) output.items = toGeminiSchemaNode(schema.items);
  if (schema.properties && typeof schema.properties === "object") {
    output.properties = Object.fromEntries(
      Object.entries(schema.properties as Record<string, unknown>).map(
        ([key, child]) => [key, toGeminiSchemaNode(child)],
      ),
    );
  }
  return output;
}

export const CV_TAILORING_VERSION = "m4-cv-tailoring-v9";

export function createCvTailoringResponseSchema(
  profileEvidenceIds: string[],
  jobEvidenceIds: string[],
  targetPaths: string[],
  requirementIds: string[],
) {
  // Keep the provider-facing JSON schema compact. Membership is enforced by
  // the validator below instead of repeating large enums throughout the schema.
  const profileRef = evidenceRef();
  const jobRef = evidenceRef();
  const targetPath = evidenceRef();
  const requirementId = evidenceRef();
  const allowedProfileRefs = new Set(profileEvidenceIds);
  const allowedJobRefs = new Set(jobEvidenceIds);
  const allowedTargetPaths = new Set(targetPaths);
  const allowedRequirementIds = new Set(requirementIds);
  const validator = z
    .object({
      suggestions: z.array(
        z
          .object({
            targetPath,
            originalText: z.string().nullable(),
            proposedText: z.string().min(1),
            reason: z.string().min(1),
            profileEvidenceRefs: z.array(profileRef).min(1),
            requirementIds: z.array(requirementId),
            jobEvidenceRefs: z.array(jobRef).min(1),
          })
          .strict(),
      ),
      coveredRequirementIds: z.array(requirementId),
      gaps: z.array(
        z
          .object({
            requirementId,
            explanation: z.string().min(1),
            jobEvidenceRefs: z.array(jobRef).min(1),
          })
          .strict(),
      ),
    })
    .strict()
    .superRefine((output, context) => {
      const checkRefs = (
        refs: string[],
        allowed: Set<string>,
        path: (string | number)[],
        label: string,
      ) => {
        refs.forEach((ref, index) => {
          if (!allowed.has(ref)) {
            context.addIssue({
              code: "custom",
              path: [...path, index],
              message: `Unknown ${label} reference: ${ref}`,
            });
          }
        });
      };

      output.suggestions.forEach((suggestion, index) => {
        if (!allowedTargetPaths.has(suggestion.targetPath)) {
          context.addIssue({
            code: "custom",
            path: ["suggestions", index, "targetPath"],
            message: "Unknown editable target path.",
          });
        }
        checkRefs(
          suggestion.profileEvidenceRefs,
          allowedProfileRefs,
          ["suggestions", index, "profileEvidenceRefs"],
          "profile evidence",
        );
        checkRefs(
          suggestion.jobEvidenceRefs,
          allowedJobRefs,
          ["suggestions", index, "jobEvidenceRefs"],
          "job evidence",
        );
        checkRefs(
          suggestion.requirementIds,
          allowedRequirementIds,
          ["suggestions", index, "requirementIds"],
          "requirement",
        );
      });
      checkRefs(
        output.coveredRequirementIds,
        allowedRequirementIds,
        ["coveredRequirementIds"],
        "requirement",
      );
      output.gaps.forEach((gap, index) => {
        if (!allowedRequirementIds.has(gap.requirementId)) {
          context.addIssue({
            code: "custom",
            path: ["gaps", index, "requirementId"],
            message: "Unknown requirement reference.",
          });
        }
        checkRefs(
          gap.jobEvidenceRefs,
          allowedJobRefs,
          ["gaps", index, "jobEvidenceRefs"],
          "job evidence",
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
      const classified = [
        ...output.coveredRequirementIds,
        ...output.gaps.map((gap) => gap.requirementId),
      ];
      const unique = new Set(classified);
      if (
        unique.size !== classified.length ||
        unique.size !== requirementIds.length ||
        requirementIds.some((id) => !unique.has(id))
      ) {
        context.addIssue({
          code: "custom",
          path: ["coveredRequirementIds"],
          message:
            "Every job requirement must be classified exactly once as covered or a gap.",
        });
      }
    });

  const jsonSchema = z.toJSONSchema(validator, {
    target: "draft-07",
    unrepresentable: "any",
  });
  const responseSchema = toGeminiSchemaNode(jsonSchema);

  return { validator, responseSchema };
}

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
            requirementIds: z.array(evidenceRef()).min(1),
            jobEvidenceRefs: z.array(evidenceRef()).min(1),
          })
          .strict(),
      ),
    })
    .strict()
    .superRefine((output, context) => {
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
  const jsonSchema = z.toJSONSchema(validator, {
    target: "draft-07",
    unrepresentable: "any",
  });
  return { validator, responseSchema: toGeminiSchemaNode(jsonSchema) };
}

export type CvSectionTailoringModelOutput = z.infer<
  ReturnType<typeof createCvSectionTailoringResponseSchema>["validator"]
>;

export type CvTailoringModelOutput = z.infer<
  ReturnType<typeof createCvTailoringResponseSchema>["validator"]
>;
