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
  const { profileEvidence, editableTargets: allEditableTargets } =
    buildCvTailoringEvidence(masterContent, draftContent);
  // M4 currently reviews only the professional summary. Keep other CV sections
  // unchanged until their own section-by-section review experience is ready.
  const editableTargets = allEditableTargets.filter(
    (target) => target.path === "professionalSummary",
  );
  // This pipeline edits only the summary. Sending evidence from every other CV
  // section adds tokens without improving the factual basis for this proposal.
  const summaryEvidence = profileEvidence.filter(
    (item) => item.id === "cv:professionalSummary",
  );
  const allJobEvidence = buildJobEvidence(job.description, jobContext);
  // The response classifies requirements, so only requirement-linked advert
  // excerpts are needed here; responsibilities/capabilities are not output.
  const referencedJobIds = new Set(
    understanding.requirements.flatMap((item) => item.sourceEvidenceRefs),
  );
  const jobEvidence = allJobEvidence.filter((item) => referencedJobIds.has(item.id));
  if (!summaryEvidence.length || !jobEvidence.length || !editableTargets.length) {
    throw new Error("There is not enough confirmed evidence to tailor this CV.");
  }

  const schema = createCvTailoringResponseSchema(
    summaryEvidence.map((item) => item.id),
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
    // The job description is already represented by jobEvidence and the
    // canonical understanding. Avoid sending a second copy of the advert.
    userPrompt: JSON.stringify({
      job: [job.title, job.company],
      understanding: {
        coverage: understanding.coverage,
        requirements: understanding.requirements.map((item) => [
          item.id,
          item.statement,
          item.category,
          item.importance,
          item.sourceEvidenceRefs,
        ]),
      },
      jobEvidence: jobEvidence.map((item) => [item.id, item.content]),
      confirmedCvEvidence: summaryEvidence.map((item) => [item.id, item.content]),
      editableTargets: editableTargets.map((item) => [item.path, item.currentText, item.profileEvidenceRef]),
    }),
  };
  const response = provider
    ? await completeAiTaskWithProvider(provider, request)
    : await completeAiTask(request);

  const parsed = schema.validator.parse(JSON.parse(response.content));
  const mapped = mapCvTailoringOutput(
    parsed,
    summaryEvidence,
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
