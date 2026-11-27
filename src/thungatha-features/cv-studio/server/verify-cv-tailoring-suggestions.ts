import "server-only";
import {
  completeAiTask,
  completeAiTaskWithProvider,
} from "@/lib/ai/provider-router";
import type { AiProvider } from "@/lib/ai/contracts";
import { toGeminiResponseSchema } from "./cv-tailoring-gemini-schema";
import type { TailoringSuggestionInput } from "./cv-tailoring-suggestion-mapper";
import { cvTailoringReviewSchema } from "./cv-tailoring-verification-schema";
import { retainApprovedSuggestions } from "./cv-tailoring-verification-review";

export { retainApprovedSuggestions };

export async function verifyCvTailoringSuggestions(
  suggestions: TailoringSuggestionInput[],
  profileEvidence: Array<{ id: string; content: string }>,
  jobEvidence: Array<{ id: string; content: string }>,
  requirements: Array<{
    id: string;
    statement: string;
    sourceEvidenceRefs?: string[];
  }>,
  provider?: Exclude<AiProvider, "ollama-cloud">,
) {
  if (!suggestions.length) return suggestions;
  const request = {
    task: "cv-tailoring" as const,
    responseFormat: "json" as const,
    responseSchema: toGeminiResponseSchema(cvTailoringReviewSchema),
    temperature: 0,
    maxOutputTokens: Math.max(512, suggestions.length * 120),
    timeoutMs: 120_000,
    reasoning: false,
    systemPrompt: [
      "Independently verify each proposed CV edit. You are a strict reviewer, not a rewriter.",
      "Compare originalText, proposedText, the exact cited profile evidence, and the cited job requirements. The profile evidence is the factual authority; job wording is never evidence about the candidate.",
      "Approve only if the proposed text preserves every factual detail and the exact scope of the original and profile evidence, is grammatical, and materially improves this CV for this role.",
      "Reject a change that upgrades the scope of work or substitutes a broader job-description phrase for a narrower source fact. For example, changing 'web pages' to 'web applications' is an unsupported scope expansion unless the profile evidence independently says applications.",
      "Reject edits that mainly copy or mirror wording from the job description, replace accurate wording with synonyms, or combine sentences without adding a clear and material improvement.",
      "A valid alignment is not automatically a useful edit. If the original already communicates the relevant experience clearly, reject the suggestion and leave the original unchanged.",
      "Reject invented or strengthened claims, changed dates/metrics/tools/responsibilities, omitted useful details, unrelated requirement links, awkward wording, missing spaces, or unsupported implications.",
      "Do not infer candidate facts from job evidence. Do not approve merely because the proposed text contains keywords from the job description.",
      "Review every suggestion exactly once by its zero-based index. Return one review per index, with decision approve or reject and a concise issue string (empty when approved). Return JSON only.",
    ].join("\n"),
    userPrompt: JSON.stringify({
      suggestions,
      profileEvidence,
      jobEvidence,
      requirements,
    }),
  };
  const response = provider
    ? await completeAiTaskWithProvider(provider, request)
    : await completeAiTask(request);
  if (
    ["MAX_TOKENS", "LENGTH"].includes(
      response.finishReason?.toUpperCase() ?? "",
    )
  ) {
    throw new Error(
      "CV tailoring verification returned an incomplete response.",
    );
  }
  const parsed = cvTailoringReviewSchema.parse(JSON.parse(response.content));
  return retainApprovedSuggestions(suggestions, parsed.reviews);
}
