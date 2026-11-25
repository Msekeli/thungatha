import type { CandidateFacts } from "@/thungatha-features/user-profile/server/candidate-facts";
import type { JobUnderstanding } from "./job-ai-schemas";
import { buildJobAssessmentPrompt } from "./job-ai-prompts";
import type { createMatchAssessmentResponseSchema } from "./job-ai-schemas";

type AssessmentResponseSchema =
  ReturnType<typeof createMatchAssessmentResponseSchema>["responseSchema"];

export function buildJobAssessmentRequest(
  understanding: JobUnderstanding,
  jobEvidence: Array<{ id: string; content: string }>,
  profileEvidence: Array<{ id: string; content: string }>,
  facts: CandidateFacts,
  responseSchema: AssessmentResponseSchema,
) {
  const compactUnderstanding = {
    coverage: understanding.coverage,
    responsibilities: understanding.responsibilities.map((item) => [
      item.id, item.statement, item.sourceEvidenceRefs,
    ]),
    capabilities: understanding.capabilities.map((item) => [
      item.id, item.name, item.context, item.sourceEvidenceRefs,
    ]),
    requirements: understanding.requirements.map((item) => [
      item.id, item.statement, item.category, item.importance,
      item.sourceEvidenceRefs,
    ]),
  };
  const compactJobEvidence = jobEvidence.map((item) => [item.id, item.content]);
  const compactProfileEvidence = profileEvidence.map((item) => [
    item.id, item.content,
  ]);
  const maxOutputTokens =
    2_048 +
    understanding.requirements.length * 384 +
    (jobEvidence.length + profileEvidence.length) * 32;

  return {
    task: "job-fit-assessment" as const,
    responseFormat: "json" as const,
    responseSchema,
    temperature: 0.1,
    maxOutputTokens,
    timeoutMs: 120_000,
    reasoning: false,
    systemPrompt: buildJobAssessmentPrompt(),
    userPrompt: JSON.stringify({
      jobUnderstanding: compactUnderstanding,
      jobEvidence: compactJobEvidence,
      confirmedProfileEvidence: compactProfileEvidence,
      employmentFacts: [
        facts.knownEmploymentMonths,
        facts.employmentEvidenceRefs,
        facts.unknownEmploymentPeriodRefs,
      ],
    }),
  };
}
