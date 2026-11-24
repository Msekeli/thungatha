import "server-only";
import { z } from "zod";
import { completeAiTask, completeAiTaskWithProvider } from "@/lib/ai/provider-router";
import type { AiProvider } from "@/lib/ai/contracts";

type Suggestion = {
  targetPath: string;
  originalText: string | null;
  proposedText: string;
  reason: string;
  profileEvidenceRefs: string[];
  requirementIds: string[];
  jobEvidenceRefs: string[];
};

function toGeminiSchema(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const schema = value as Record<string, unknown>;
  const types: Record<string, string> = {
    object: "OBJECT", array: "ARRAY", string: "STRING",
    number: "NUMBER", integer: "INTEGER", boolean: "BOOLEAN",
  };
  const output: Record<string, unknown> = {};
  if (typeof schema.type === "string") output.type = types[schema.type] ?? schema.type.toUpperCase();
  for (const key of ["enum", "required", "description"]) {
    if (schema[key] !== undefined) output[key] = schema[key];
  }
  if (schema.items) output.items = toGeminiSchema(schema.items);
  if (schema.properties && typeof schema.properties === "object") {
    output.properties = Object.fromEntries(
      Object.entries(schema.properties as Record<string, unknown>)
        .map(([key, child]) => [key, toGeminiSchema(child)]),
    );
  }
  return output;
}

const reviewSchema = z.object({
  reviews: z.array(z.object({
    index: z.number().int().nonnegative(),
    decision: z.enum(["approve", "reject"]),
    issue: z.string(),
  }).strict()),
}).strict();

export function retainApprovedSuggestions(
  suggestions: Suggestion[],
  reviews: z.infer<typeof reviewSchema>["reviews"],
) {
  if (reviews.some((review) => review.index >= suggestions.length)) {
    throw new Error("CV tailoring verification returned an unknown suggestion.");
  }
  const byIndex = new Map(reviews.map((review) => [review.index, review]));
  if (byIndex.size !== suggestions.length || suggestions.some((_, index) => !byIndex.has(index))) {
    throw new Error("CV tailoring verification did not review every suggestion exactly once.");
  }
  return suggestions.filter((_, index) => byIndex.get(index)?.decision === "approve");
}

export async function verifyCvTailoringSuggestions(
  suggestions: Suggestion[],
  profileEvidence: Array<{ id: string; content: string }>,
  jobEvidence: Array<{ id: string; content: string }>,
  requirements: Array<{ id: string; statement: string; sourceEvidenceRefs?: string[] }>,
  provider?: Exclude<AiProvider, "ollama-cloud">,
) {
  if (!suggestions.length) return suggestions;
  const request = {
    task: "cv-tailoring" as const,
    responseFormat: "json" as const,
    responseSchema: toGeminiSchema(z.toJSONSchema(reviewSchema, { target: "draft-07" })),
    temperature: 0,
    maxOutputTokens: Math.max(512, suggestions.length * 120),
    timeoutMs: 120_000,
    reasoning: false,
    systemPrompt: [
      "Independently verify each proposed CV edit. You are a strict reviewer, not a rewriter.",
      "Approve only when proposedText preserves the exact factual meaning and scope of the cited profile evidence, directly addresses the cited job requirements, and is grammatical, readable English with normal word spacing.",
      "The edit must materially improve the CV for this specific role through clearer relevance, stronger information hierarchy, or more concise expression without losing useful detail.",
      "Reject cosmetic paraphrases, synonym swaps, or sentence combinations that do not provide a clear improvement over originalText. A truthful but low-value rewrite must be rejected.",
      "Reject invented or strengthened claims, changed dates/metrics/tools/responsibilities, unrelated requirement links, awkward wording, missing spaces, or unsupported implications.",
      "Do not reject a genuinely useful edit merely because it uses different wording. Do not infer facts from the job description.",
      "Review every suggestion exactly once by its zero-based index. Return one review per index, with decision approve or reject and a concise issue string (empty when approved). Return JSON only.",
    ].join("\n"),
    userPrompt: JSON.stringify({ suggestions, profileEvidence, jobEvidence, requirements }),
  };
  const response = provider
    ? await completeAiTaskWithProvider(provider, request)
    : await completeAiTask(request);
  if (["MAX_TOKENS", "LENGTH"].includes(response.finishReason?.toUpperCase() ?? "")) {
    throw new Error("CV tailoring verification returned an incomplete response.");
  }
  const parsed = reviewSchema.parse(JSON.parse(response.content));
  return retainApprovedSuggestions(suggestions, parsed.reviews);
}
