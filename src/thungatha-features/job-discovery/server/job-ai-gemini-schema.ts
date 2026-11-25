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
  if (typeof schema.description === "string") {
    output.description = schema.description;
  }
  if (typeof schema.format === "string") output.format = schema.format;
  if (schema.items && typeof schema.items === "object") {
    output.items = toGeminiSchemaNode(schema.items);
  }
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
