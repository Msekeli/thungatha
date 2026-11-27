import { completeAiTask } from "@/lib/ai/provider-router";
import type { JobUnderstanding } from "@/thungatha-features/job-discovery/server/job-ai-schemas";
import { buildCvWorkExperienceTailoringSystemPrompt } from "./cv-tailoring-prompt";
import { compactRequirements } from "./cv-tailoring-job-context";
import { createCvSectionTailoringResponseSchema } from "./cv-tailoring-schema";

type SectionSchema = ReturnType<typeof createCvSectionTailoringResponseSchema>;

export function requestExperienceSuggestions(
  job: { title: string; company: string | null },
  experience: { sourceId: string; jobTitle: string; employer: string },
  understanding: JobUnderstanding,
  schema: SectionSchema,
  jobEvidence: Array<{ id: string; content: string }>,
  profileEvidence: Array<{ id: string; content: string }>,
  targets: Array<{
    path: string;
    currentText: string | null;
    profileEvidenceRef: string | null;
  }>,
) {
  return completeAiTask({
    task: "cv-tailoring",
    responseFormat: "json",
    responseSchema: schema.responseSchema,
    temperature: 0.2,
    timeoutMs: 120_000,
    systemPrompt: buildCvWorkExperienceTailoringSystemPrompt(),
    userPrompt: JSON.stringify({
      job: [job.title, job.company],
      selectedExperience: experience,
      jobRequirements: compactRequirements(understanding.requirements),
      jobEvidence: jobEvidence.map((item) => [item.id, item.content]),
      confirmedCvEvidence: profileEvidence.map((item) => [
        item.id,
        item.content,
      ]),
      editableTargets: targets.map((item) => [
        item.path,
        item.currentText,
        item.profileEvidenceRef,
      ]),
    }),
  });
}
