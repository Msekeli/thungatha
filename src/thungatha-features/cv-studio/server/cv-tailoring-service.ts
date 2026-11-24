import "server-only";
import {
  completeAiTask,
  completeAiTaskWithProvider,
} from "@/lib/ai/provider-router";
import type { AiProvider } from "@/lib/ai/contracts";
import { buildJobEvidence } from "@/thungatha-features/job-discovery/server/job-ai-evidence";
import { getOrCreateJobUnderstanding } from "@/thungatha-features/job-discovery/server/job-ai-understanding-cache";
import type { JobMatchingContext } from "@/thungatha-features/job-discovery/server/job-ai-queue-eligibility";
import type { JobUnderstanding } from "@/thungatha-features/job-discovery/server/job-ai-schemas";
import type { CvContent } from "./cv-studio-schema";
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
  const jobContext: JobMatchingContext = {
    title: job.title,
    employerName: job.company,
    locationText: job.location,
    description: job.description,
  };
  const understanding = await getOrCreateJobUnderstanding(jobContext);
  return generateCvTailoringSuggestionsFromUnderstanding(
    masterContent,
    draftContent,
    job,
    understanding.analysis,
  );
}

/** Shared tailoring pipeline; accepts an existing canonical understanding for isolated provider tests. */
export async function generateCvTailoringSuggestionsFromUnderstanding(
  masterContent: CvContent,
  draftContent: CvContent,
  job: CvTailoringJob,
  understanding: JobUnderstanding,
  provider?: Exclude<AiProvider, "ollama-cloud">,
) {
  const jobContext: JobMatchingContext = {
    title: job.title,
    employerName: job.company,
    locationText: job.location,
    description: job.description,
  };
  const { profileEvidence, editableTargets } =
    buildCvTailoringEvidence(masterContent, draftContent);
  const allJobEvidence = buildJobEvidence(job.description, jobContext);
  const referencedJobIds = new Set([
    ...understanding.responsibilities.flatMap((item) => item.sourceEvidenceRefs),
    ...understanding.capabilities.flatMap((item) => item.sourceEvidenceRefs),
    ...understanding.requirements.flatMap((item) => item.sourceEvidenceRefs),
  ]);
  const jobEvidence = allJobEvidence.filter((item) => referencedJobIds.has(item.id));
  if (!profileEvidence.length || !jobEvidence.length || !editableTargets.length) {
    throw new Error("There is not enough confirmed evidence to tailor this CV.");
  }

  const schema = createCvTailoringResponseSchema(
    profileEvidence.map((item) => item.id),
    jobEvidence.map((item) => item.id),
    editableTargets.map((item) => item.path),
    understanding.requirements.map((item) => item.id),
  );
  const request = {
    task: "cv-tailoring" as const,
    responseFormat: "json" as const,
    responseSchema: schema.responseSchema,
    temperature: 0.2,
    timeoutMs: 120_000,
    systemPrompt: buildCvTailoringSystemPrompt(),
    userPrompt: JSON.stringify({
      job: { title: job.title, company: job.company },
      jobUnderstanding: understanding,
      jobEvidence,
      confirmedCvEvidence: profileEvidence,
      editableTargets,
    }),
  };
  const response = provider
    ? await completeAiTaskWithProvider(provider, request)
    : await completeAiTask(request);

  const parsed = schema.validator.parse(JSON.parse(response.content));
  const mapped = mapCvTailoringOutput(
    parsed,
    profileEvidence,
    jobEvidence,
    editableTargets,
    understanding.requirements,
  );
  return {
    ...mapped,
    provider: response.provider,
    model: response.model,
    taskVersion: CV_TAILORING_VERSION,
  };
}
