import "server-only";
import { completeAiTask } from "@/lib/ai/provider-router";
import { createMatchAssessmentResponseSchema } from "./job-ai-schemas";
import {
  assertCompleteResponse,
  parseAiResponse,
} from "./job-ai-response-validation";
import { buildAssessmentRepairPrompt } from "./job-ai-prompts";

export async function parseAssessmentWithJsonRepair(
  content: string,
  modelSchema: ReturnType<typeof createMatchAssessmentResponseSchema>,
) {
  try {
    return parseAiResponse("Candidate assessment", content, modelSchema.validator);
  } catch (error) {
    if (
      !(error instanceof Error) ||
      !error.message.includes("AI returned invalid JSON")
    ) throw error;

    const repair = await completeAiTask({
      task: "job-fit-assessment",
      responseFormat: "json",
      responseSchema: modelSchema.responseSchema,
      temperature: 0,
      maxOutputTokens: 2_048,
      timeoutMs: 120_000,
      reasoning: false,
      systemPrompt: buildAssessmentRepairPrompt(),
      userPrompt: content,
    });
    assertCompleteResponse("Candidate assessment JSON repair", repair);
    return parseAiResponse("Candidate assessment", repair.content, modelSchema.validator);
  }
}
