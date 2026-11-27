import "server-only";
import { completeAiTask } from "@/lib/ai/provider-router";
import type { CandidateFacts } from "@/thungatha-features/user-profile/server/candidate-facts";
import type { JobMatchingContext } from "./job-ai-queue-eligibility";
import type { JobUnderstanding } from "./job-ai-schemas";
import { buildJobEvidence, buildProfileEvidence } from "./job-ai-evidence";
import { createMatchAssessmentResponseSchema } from "./job-ai-schemas";
import {
  AssessmentUnavailableError,
  validateAndClassifyAssessment,
} from "./job-ai-classification";
import { assertCompleteResponse } from "./job-ai-response-validation";
import { parseAssessmentWithJsonRepair } from "./job-ai-assessment-response";
import { attachCanonicalRequirements } from "./job-ai-assessment-mapping";
import { buildJobAssessmentRequest } from "./job-ai-assessment-request";

export async function assessJobWithAi(
  context: JobMatchingContext,
  understanding: JobUnderstanding,
  facts: CandidateFacts,
) {
  const allJobEvidence = buildJobEvidence(context.description, context);
  const referencedJobIds = new Set([
    ...understanding.responsibilities.flatMap(
      (item) => item.sourceEvidenceRefs,
    ),
    ...understanding.capabilities.flatMap((item) => item.sourceEvidenceRefs),
    ...understanding.requirements.flatMap((item) => item.sourceEvidenceRefs),
  ]);
  const referencedJobEvidence = allJobEvidence.filter((item) =>
    referencedJobIds.has(item.id),
  );
  const metadataEvidence = allJobEvidence.filter(
    (item) => item.sourcePath !== "description",
  );
  const jobEvidence = referencedJobEvidence.length
    ? [...metadataEvidence, ...referencedJobEvidence]
    : allJobEvidence;
  const profileEvidence = buildProfileEvidence(facts);

  if (!jobEvidence.length) {
    throw new Error("The job advert does not contain usable source evidence.");
  }
  if (!profileEvidence.length) {
    throw new AssessmentUnavailableError(
      "The confirmed Profile does not contain enough evidence to assess this role.",
    );
  }

  const modelSchema = createMatchAssessmentResponseSchema(
    jobEvidence.map((item) => item.id),
    profileEvidence.map((item) => item.id),
    understanding.requirements.map((item) => item.id),
  );
  const request = buildJobAssessmentRequest(
    understanding,
    jobEvidence,
    profileEvidence,
    facts,
    modelSchema.responseSchema,
  );
  const response = await completeAiTask(request);
  assertCompleteResponse("Candidate assessment", response);
  const modelOutput = await parseAssessmentWithJsonRepair(
    response.content,
    modelSchema,
  );
  const assessmentInput = attachCanonicalRequirements(
    modelOutput,
    understanding,
  );
  const assessment = validateAndClassifyAssessment(
    assessmentInput,
    understanding,
    new Set(jobEvidence.map((item) => item.id)),
    new Set(profileEvidence.map((item) => item.id)),
  );
  return { assessment, provider: response.provider, model: response.model };
}
