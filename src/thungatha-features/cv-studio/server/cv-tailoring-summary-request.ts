import { completeAiTask, completeAiTaskWithProvider } from "@/lib/ai/provider-router";
import type { JobUnderstanding } from "@/thungatha-features/job-discovery/server/job-ai-schemas";
import { buildCvTailoringSystemPrompt } from "./cv-tailoring-prompt";
import { compactRequirements } from "./cv-tailoring-job-context";
import type { CvTailoringProvider } from "./cv-tailoring-service-types";
import { createCvTailoringResponseSchema } from "./cv-tailoring-schema";

type SummarySchema = ReturnType<typeof createCvTailoringResponseSchema>;

export async function requestSummarySuggestions(
  job: { title: string; company: string | null },
  understanding: JobUnderstanding,
  schema: SummarySchema,
  jobEvidence: Array<{ id: string; content: string }>,
  profileEvidence: Array<{ id: string; content: string }>,
  targets: Array<{ path: string; currentText: string | null; profileEvidenceRef: string | null }>,
  provider?: CvTailoringProvider,
) {
  const request = {
    task: "cv-tailoring" as const,
    responseFormat: "json" as const,
    responseSchema: schema.responseSchema,
    temperature: 0.2,
    timeoutMs: 120_000,
    systemPrompt: buildCvTailoringSystemPrompt(),
    userPrompt: JSON.stringify({
      job: [job.title, job.company],
      understanding: { requirements: compactRequirements(understanding.requirements) },
      jobEvidence: jobEvidence.map((item) => [item.id, item.content]),
      confirmedCvEvidence: profileEvidence.map((item) => [item.id, item.content]),
      editableTargets: targets.map((item) => [
        item.path, item.currentText, item.profileEvidenceRef,
      ]),
    }),
  };
  return provider
    ? completeAiTaskWithProvider(provider, request)
    : completeAiTask(request);
}
