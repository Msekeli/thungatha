import { z } from "zod";

const GEMINI_TYPES: Record<string, string> = {
  object: "OBJECT",
  array: "ARRAY",
  string: "STRING",
  number: "NUMBER",
  integer: "INTEGER",
  boolean: "BOOLEAN",
};

export function toGeminiSchemaNode(value: unknown): Record<string, unknown> {
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

export function toGeminiResponseSchema(schema: z.ZodType) {
  return toGeminiSchemaNode(
    z.toJSONSchema(schema, {
      target: "draft-07",
      unrepresentable: "any",
    }),
  );
}
