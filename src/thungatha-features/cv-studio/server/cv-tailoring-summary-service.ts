import type { JobUnderstanding } from "@/thungatha-features/job-discovery/server/job-ai-schemas";
import type { CvContent } from "./cv-studio-schema";
import { buildCvTailoringEvidence } from "./cv-tailoring-evidence";
import { selectJobEvidence, selectSummaryEvidence } from "./cv-tailoring-evidence-selection";
import { toJobMatchingContext } from "./cv-tailoring-job-context";
import { mapCvTailoringOutput } from "./map-cv-tailoring-output";
import {
  CV_TAILORING_VERSION,
  createCvTailoringResponseSchema,
} from "./cv-tailoring-schema";
import { requestSummarySuggestions } from "./cv-tailoring-summary-request";
import type { CvTailoringJob, CvTailoringProvider } from "./cv-tailoring-service-types";
import { buildJobEvidence } from "@/thungatha-features/job-discovery/server/job-ai-evidence";

export async function generateCvTailoringSuggestionsFromUnderstanding(
  masterContent: CvContent,
  draftContent: CvContent,
  job: CvTailoringJob,
  understanding: JobUnderstanding,
  provider?: CvTailoringProvider,
) {
  const { profileEvidence, editableTargets: allTargets } =
    buildCvTailoringEvidence(masterContent, draftContent);
  const targets = allTargets.filter((item) => item.path === "professionalSummary");
  const profileSelection = selectSummaryEvidence(
    profileEvidence, understanding.requirements, 3_500,
  );
  const allJobEvidence = buildJobEvidence(job.description, toJobMatchingContext(job));
  const requiredRefs = new Set(
    understanding.requirements.flatMap((item) => item.sourceEvidenceRefs),
  );
  const jobSelection = selectJobEvidence(
    allJobEvidence.filter((item) => requiredRefs.has(item.id)),
    understanding.requirements,
    2_000,
  );
  if (!profileSelection.length || !jobSelection.length || !targets.length) {
    throw new Error("There is not enough confirmed evidence to tailor this CV.");
  }

  const schema = createCvTailoringResponseSchema(
    profileSelection.map((item) => item.id),
    jobSelection.map((item) => item.id),
    targets.map((item) => item.path),
    understanding.requirements.map((item) => item.id),
  );
  const response = await requestSummarySuggestions(
    job, understanding, schema, jobSelection, profileSelection, targets, provider,
  );
  const parsed = schema.validator.parse(JSON.parse(response.content));
  const mapped = mapCvTailoringOutput(
    parsed, profileEvidence, jobSelection, targets, understanding.requirements,
  );
  return {
    ...mapped,
    provider: response.provider,
    model: response.model,
    taskVersion: CV_TAILORING_VERSION,
  };
}
