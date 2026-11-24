import "server-only";
import { completeAiTask } from "@/lib/ai/provider-router";
import { buildJobEvidence } from "@/thungatha-features/job-discovery/server/job-ai-evidence";
import { getOrCreateJobUnderstanding } from "@/thungatha-features/job-discovery/server/job-ai-understanding-cache";
import type { JobMatchingContext } from "@/thungatha-features/job-discovery/server/job-ai-queue-eligibility";
import type { CvContent, CvSuggestion } from "./cv-studio-schema";
import { buildCvTailoringEvidence } from "./cv-tailoring-evidence";
import { buildCvTailoringSystemPrompt } from "./cv-tailoring-prompt";
import { mapCvTailoringOutput } from "./map-cv-tailoring-output";
import {
  CV_TAILORING_VERSION,
  createCvTailoringResponseSchema,
} from "./cv-tailoring-schema";

export type CvTailoringJob = {
  title: string;
  company: string | null;
  location: string | null;
  description: string;
};

export async function generateCvTailoringSuggestions(
  masterContent: CvContent,
  draftContent: CvContent,
  job: CvTailoringJob,
) {
  const { profileEvidence, editableTargets } =
    buildCvTailoringEvidence(masterContent, draftContent);
  const jobContext: JobMatchingContext = {
    title: job.title,
    employerName: job.company,
    locationText: job.location,
    description: job.description,
  };
  const understanding = await getOrCreateJobUnderstanding(jobContext);
  const allJobEvidence = buildJobEvidence(job.description, jobContext);
  const referencedJobIds = new Set([
    ...understanding.analysis.responsibilities.flatMap((item) => item.sourceEvidenceRefs),
    ...understanding.analysis.capabilities.flatMap((item) => item.sourceEvidenceRefs),
    ...understanding.analysis.requirements.flatMap((item) => item.sourceEvidenceRefs),
  ]);
  const jobEvidence = allJobEvidence.filter((item) => referencedJobIds.has(item.id));
  if (!profileEvidence.length || !jobEvidence.length || !editableTargets.length) {
    throw new Error("There is not enough confirmed evidence to tailor this CV.");
  }

  const schema = createCvTailoringResponseSchema(
    profileEvidence.map((item) => item.id),
    jobEvidence.map((item) => item.id),
    editableTargets.map((item) => item.path),
    understanding.analysis.requirements.map((item) => item.id),
  );
  const response = await completeAiTask({
    task: "cv-tailoring",
    responseFormat: "json",
    responseSchema: schema.responseSchema,
    temperature: 0.2,
    timeoutMs: 120_000,
    systemPrompt: buildCvTailoringSystemPrompt(),
    userPrompt: JSON.stringify({
      job: { title: job.title, company: job.company },
      jobUnderstanding: understanding.analysis,
      jobEvidence,
      confirmedCvEvidence: profileEvidence,
      editableTargets,
    }),
  });

  const parsed = schema.validator.parse(JSON.parse(response.content));
  const mapped = mapCvTailoringOutput(
    parsed,
    profileEvidence,
    jobEvidence,
    editableTargets,
    understanding.analysis.requirements,
  );
  return {
    ...mapped,
    provider: response.provider,
    model: response.model,
    taskVersion: CV_TAILORING_VERSION,
  };
}
