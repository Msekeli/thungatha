import { z } from "zod";

function toGeminiSchemaNode(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const schema = value as Record<string, unknown>;
  const output: Record<string, unknown> = {};
  const type = schema.type;
  if (typeof type === "string") {
    const types: Record<string, string> = {
      object: "OBJECT",
      array: "ARRAY",
      string: "STRING",
      number: "NUMBER",
      integer: "INTEGER",
      boolean: "BOOLEAN",
    };
    if (types[type]) output.type = types[type];
  }
  if (Array.isArray(schema.enum)) output.enum = schema.enum;
  if (Array.isArray(schema.required)) output.required = schema.required;
  if (typeof schema.description === "string")
    output.description = schema.description;
  if (typeof schema.format === "string") output.format = schema.format;
  if (schema.items && typeof schema.items === "object")
    output.items = toGeminiSchemaNode(schema.items);
  if (
    schema.properties &&
    typeof schema.properties === "object" &&
    !Array.isArray(schema.properties)
  ) {
    output.properties = Object.fromEntries(
      Object.entries(schema.properties).map(([key, child]) => [
        key,
        toGeminiSchemaNode(child),
      ]),
    );
  }
  return output;
}

export function toGeminiResponseSchema(
  schema: z.ZodType,
): Record<string, unknown> {
  return toGeminiSchemaNode(
    z.toJSONSchema(schema, { target: "draft-07", unrepresentable: "any" }),
  );
}

const refs = z.array(z.string().min(1));
const requiredRefs = refs.min(1);
const aggregateRefs = z.array(z.string().min(1));
const requiredAggregateRefs = aggregateRefs.min(1);

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

const requirementAssessment = z
  .object({
    id: z.string().min(1),
    requirement: z.string().min(1),
    importance: z.enum(["mandatory", "preferred", "uncertain"]),
    assessment: z.enum([
      "supported",
      "not_demonstrated",
      "contradictory",
      "uncertain",
    ]),
    explanation: z.string().min(1),
    jobEvidenceRefs: requiredRefs,
    profileEvidenceRefs: refs,
  })
  .superRefine((item, context) => {
    if (
      item.assessment === "supported" &&
      item.profileEvidenceRefs.length === 0
    ) {
      context.addIssue({
        code: "custom",
        message: "Supported requirements need confirmed Profile evidence.",
      });
    }
  });

export const matchAssessmentInputSchema = z
  .object({
    semanticAlignment: z.object({
      level: z.enum(["strong", "meaningful", "insufficient"]),
      materialGaps: z.boolean(),
      jobEvidenceRefs: requiredAggregateRefs,
      profileEvidenceRefs: aggregateRefs,
    }),
    summary: z.string().min(1),
    alignmentExplanation: z.string().min(1),
    requirements: z.array(requirementAssessment),
    gaps: z.array(
      z.object({
        description: z.string().min(1),
        jobEvidenceRefs: requiredRefs,
        profileEvidenceRefs: refs,
      }),
    ),
  })
  .superRefine((assessment, context) => {
    if (
      assessment.semanticAlignment.level !== "insufficient" &&
      assessment.semanticAlignment.profileEvidenceRefs.length === 0
    ) {
      context.addIssue({
        code: "custom",
        message: "Meaningful alignment needs confirmed Profile evidence.",
      });
    }
  });

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

export type JobUnderstanding = z.infer<typeof jobUnderstandingSchema>;
export type MatchAssessmentInput = z.infer<typeof matchAssessmentInputSchema>;
export type MatchAssessmentModelOutput = z.infer<
  ReturnType<typeof createMatchAssessmentResponseSchema>["validator"]
>;

export function createJobUnderstandingResponseSchema() {
  // Keep the provider-facing schema independent of the number of evidence
  // segments. Exact evidence membership is validated after parsing by
  // parseJobUnderstanding(), so repeating every evidence ID in JSON Schema
  // enums only inflates the prompt without adding a security boundary.
  return toGeminiResponseSchema(
    createJobUnderstandingSchema(z.string().min(1)),
  );
}

export const jobUnderstandingResponseSchema = toGeminiResponseSchema(
  jobUnderstandingSchema,
);
