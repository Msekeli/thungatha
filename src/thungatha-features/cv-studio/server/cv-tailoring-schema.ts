import { z } from "zod";

const evidenceRef = (values: string[]) => {
  const unique = [...new Set(values)];
  if (!unique.length) throw new Error("CV tailoring requires source evidence.");
  return z.enum(unique as [string, ...string[]]);
};

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
    const types = schema.type.filter((item): item is string => typeof item === "string");
    const nonNullTypes = types.filter((item) => item !== "null");
    if (nonNullTypes.length === 1) {
      output.type = GEMINI_TYPES[nonNullTypes[0]] ?? nonNullTypes[0].toUpperCase();
      if (types.includes("null")) output.nullable = true;
    }
  } else if (typeof schema.type === "string") {
    output.type = GEMINI_TYPES[schema.type] ?? schema.type.toUpperCase();
  }
  for (const key of ["enum", "required", "description", "format", "additionalProperties"]) {
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

export const CV_TAILORING_VERSION = "m4-cv-tailoring-v7";

export function createCvTailoringResponseSchema(
  profileEvidenceIds: string[],
  jobEvidenceIds: string[],
  targetPaths: string[],
  requirementIds: string[],
) {
  const profileRef = evidenceRef(profileEvidenceIds);
  const jobRef = evidenceRef(jobEvidenceIds);
  const targetPath = evidenceRef(targetPaths);
  const requirementId = requirementIds.length ? evidenceRef(requirementIds) : z.string().min(1);
  const validator = z.object({
    suggestions: z.array(
      z.object({
        targetPath,
        originalText: z.string().nullable(),
        proposedText: z.string().min(1),
        reason: z.string().min(1),
        profileEvidenceRefs: z.array(profileRef).min(1),
        requirementIds: z.array(requirementId).min(1),
        jobEvidenceRefs: z.array(jobRef).min(1),
      }).strict(),
    ),
    coveredRequirementIds: z.array(requirementId),
    gaps: z.array(
      z.object({
        requirementId,
        explanation: z.string().min(1),
        jobEvidenceRefs: z.array(jobRef).min(1),
      }).strict(),
    ),
  }).strict().superRefine((output, context) => {
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
        message: "Every job requirement must be classified exactly once as covered or a gap.",
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

export type CvTailoringModelOutput = z.infer<
  ReturnType<typeof createCvTailoringResponseSchema>["validator"]
>;
