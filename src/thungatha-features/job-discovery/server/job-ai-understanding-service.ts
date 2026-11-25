import "server-only";
import { completeAiTask } from "@/lib/ai/provider-router";
import type { JobMatchingContext } from "./job-ai-queue-eligibility";
import { buildJobEvidence } from "./job-ai-evidence";
import { createJobUnderstandingResponseSchema } from "./job-ai-schemas";
import { assertCompleteResponse } from "./job-ai-response-validation";
import { parseJobUnderstanding } from "./job-ai-understanding-validation";
import { buildJobUnderstandingPrompt } from "./job-ai-prompts";

export { parseJobUnderstanding };

export async function understandJobWithAi(context: JobMatchingContext) {
  const evidence = buildJobEvidence(context.description, context);
  if (evidence.length === 0) {
    throw new Error("The job description does not contain enough readable text.");
  }
  const responseSchema = createJobUnderstandingResponseSchema();
  const userPrompt = JSON.stringify({
    jobContext: {
      title: context.title,
      employerName: context.employerName,
      locationText: context.locationText,
    },
    sourceEvidence: evidence.map((item) => [item.id, item.content]),
  });
  const response = await completeAiTask({
    task: "job-requirement-extraction",
    responseFormat: "json",
    responseSchema,
    temperature: 0.1,
    timeoutMs: 120_000,
    reasoning: false,
    systemPrompt: buildJobUnderstandingPrompt(),
    userPrompt,
  });
  assertCompleteResponse("Job understanding", response);
  const result = parseJobUnderstanding(context, response.content);
  return {
    analysis: result,
    provider: response.provider,
    model: response.model,
  };
}
