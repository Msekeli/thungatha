import { ZodError } from "zod";

function describeJsonShape(value: unknown): string {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return `root=${Array.isArray(value) ? "array" : typeof value}`;
  }
  const record = value as Record<string, unknown>;
  const keys = Object.keys(record).slice(0, 20);
  const arrays = ["responsibilities", "capabilities", "requirements"]
    .filter((key) => Array.isArray(record[key]))
    .map((key) => {
      const items = record[key] as unknown[];
      const first = items[0];
      const itemKeys =
        first && typeof first === "object" && !Array.isArray(first)
          ? Object.keys(first as Record<string, unknown>).slice(0, 12)
          : [];
      return `${key}=${items.length} items; firstItemKeys=[${itemKeys.join(",")}]`;
    });
  return `topLevelKeys=[${keys.join(",")}]; ${arrays.join("; ")}`;
}

export function parseAiResponse<T>(
  stage: string,
  content: string,
  schema: { parse: (value: unknown) => T },
): T {
  let value: unknown;
  try {
    value = JSON.parse(content);
  } catch (cause) {
    const detail = cause instanceof Error
      ? cause.message
      : "unknown JSON parsing error";
    throw new Error(`${stage}: AI returned invalid JSON (${detail}).`);
  }
  try {
    return schema.parse(value);
  } catch (cause) {
    if (cause instanceof ZodError) {
      const issues = cause.issues.slice(0, 12).map((issue) => {
        const path = issue.path.length ? issue.path.join(".") : "(root)";
        return `${path}: ${issue.message}`;
      });
      throw new Error(
        `${stage}: AI output failed schema validation: ${issues.join("; ")}. Returned shape: ${describeJsonShape(value)}`,
      );
    }
    throw new Error(`${stage}: AI output could not be validated.`);
  }
}

export function assertCompleteResponse(
  stage: string,
  response: { provider: string; finishReason?: string },
) {
  const finishReason = response.finishReason?.toUpperCase();
  if (finishReason === "MAX_TOKENS" || finishReason === "LENGTH") {
    throw new Error(
      `${stage}: ${response.provider} stopped at the output-token limit; the JSON response may be incomplete.`,
    );
  }
}
