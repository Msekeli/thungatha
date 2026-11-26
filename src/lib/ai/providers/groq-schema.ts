const JSON_SCHEMA_TYPES: Record<string, string> = {
  OBJECT: "object",
  ARRAY: "array",
  STRING: "string",
  NUMBER: "number",
  INTEGER: "integer",
  BOOLEAN: "boolean",
};

/** Convert the provider-neutral/Gemini schema representation into strict OpenAI JSON Schema. */
export function toOpenAiJsonSchema(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const schema = value as Record<string, unknown>;
  const output: Record<string, unknown> = {};

  if (Array.isArray(schema.anyOf)) {
    output.anyOf = schema.anyOf.map(toOpenAiJsonSchema);
  }
  if (Array.isArray(schema.type)) {
    output.anyOf = schema.type.map((type) => toOpenAiJsonSchema({ type }));
  } else if (typeof schema.type === "string") {
    output.type = JSON_SCHEMA_TYPES[schema.type] ?? schema.type.toLowerCase();
  }
  if (Array.isArray(schema.enum)) output.enum = schema.enum;
  if (typeof schema.description === "string") {
    output.description = schema.description;
  }
  if (typeof schema.format === "string") output.format = schema.format;
  if (schema.items && typeof schema.items === "object") {
    output.items = toOpenAiJsonSchema(schema.items);
  }
  if (
    schema.properties &&
    typeof schema.properties === "object" &&
    !Array.isArray(schema.properties)
  ) {
    const properties = schema.properties as Record<string, unknown>;
    output.properties = Object.fromEntries(
      Object.entries(properties).map(([key, child]) => [
        key,
        toOpenAiJsonSchema(child),
      ]),
    );
    output.required = Object.keys(properties);
    output.additionalProperties = false;
  }
  return output;
}
