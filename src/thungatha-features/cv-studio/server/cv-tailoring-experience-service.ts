import "server-only";
import { getOrCreateJobUnderstanding } from "@/thungatha-features/job-discovery/server/job-ai-understanding-cache";
import { buildJobEvidence } from "@/thungatha-features/job-discovery/server/job-ai-evidence";
import type { CvContent } from "./cv-studio-schema";
import { buildCvTailoringEvidence } from "./cv-tailoring-evidence";
import { selectJobEvidence } from "./cv-tailoring-evidence-selection";
import { toJobMatchingContext } from "./cv-tailoring-job-context";
import {
  CV_TAILORING_VERSION,
  createCvSectionTailoringResponseSchema,
} from "./cv-tailoring-schema";
import { mapCvSectionTailoringOutput } from "./map-cv-tailoring-output";
import { requestExperienceSuggestions } from "./cv-tailoring-experience-request";
import type { CvTailoringJob } from "./cv-tailoring-service-types";

export async function generateCvWorkExperienceSuggestions(
  masterContent: CvContent,
  draftContent: CvContent,
  job: CvTailoringJob,
  experienceSourceId: string,
) {
  const source = masterContent.workExperience.find((item) => item.sourceId === experienceSourceId);
  const draft = draftContent.workExperience.find((item) => item.sourceId === experienceSourceId);
  if (!source || !draft) {
    throw new Error("The selected work experience could not be found in this CV.");
  }
  const understanding = await getOrCreateJobUnderstanding(toJobMatchingContext(job));
  const requirements = understanding.analysis.requirements;
  if (!requirements.length) {
    throw new Error("No structured job requirements are available to justify an experience update.");
  }

  const evidence = buildCvTailoringEvidence(masterContent, draftContent);
  const prefix = `cv:workExperience[${experienceSourceId}]`;
  const profileEvidence = evidence.profileEvidence.filter((item) => item.id.startsWith(`${prefix}.`));
  const targetPrefix = `workExperience[${experienceSourceId}]`;
  const targets = evidence.editableTargets.filter((item) =>
    item.path.startsWith(`${targetPrefix}.`) &&
    item.path.endsWith(".description") &&
    item.profileEvidenceRef !== null
  );
  if (!profileEvidence.length || !targets.length) {
    throw new Error("This work experience has no confirmed description available to tailor.");
  }

  const jobEvidence = selectJobEvidence(
    buildJobEvidence(job.description, toJobMatchingContext(job)),
    requirements,
    2_000,
  );
  if (!jobEvidence.length) {
    throw new Error("There is not enough job-description evidence to tailor this experience.");
  }
  const schema = createCvSectionTailoringResponseSchema(
    profileEvidence.map((item) => item.id),
    jobEvidence.map((item) => item.id),
    targets.map((item) => item.path),
    requirements.map((item) => item.id),
  );
  const response = await requestExperienceSuggestions(
    { title: job.title, company: job.company },
    { sourceId: experienceSourceId, jobTitle: source.jobTitle, employer: source.employer },
    understanding.analysis,
    schema,
    jobEvidence,
    profileEvidence,
    targets,
  );
  const parsed = schema.validator.parse(JSON.parse(response.content));
  const mapped = mapCvSectionTailoringOutput(
    parsed, profileEvidence, jobEvidence, targets, requirements,
  );
  return {
    ...mapped,
    provider: response.provider,
    model: response.model,
    taskVersion: CV_TAILORING_VERSION,
  };
}
