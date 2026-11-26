import { buildJobEvidence } from "@/thungatha-features/job-discovery/server/job-ai-evidence";
import { readCandidateFacts } from "@/thungatha-features/user-profile/server/read-candidate-facts";
import type { JobMatchingContext } from "@/thungatha-features/job-discovery/server/job-ai-queue-eligibility";

type RawAssessment = {
  semanticAlignment?: {
    jobEvidenceRefs: string[];
    profileEvidenceRefs: string[];
  };
  requirements?: Array<{
    jobEvidenceRefs: string[];
    profileEvidenceRefs: string[];
  }>;
  gaps?: Array<{ jobEvidenceRefs: string[]; profileEvidenceRefs: string[] }>;
};

export async function resolveEvidenceLinkedAssessment(input: {
  userId: string;
  token: () => Promise<string | null>;
  context: JobMatchingContext;
  assessment: RawAssessment;
  understandingData?: { understanding?: unknown } | null;
}) {
  const facts = await readCandidateFacts(input.userId, input.token);
  const jobEvidence = buildJobEvidence(
    input.context.description,
    input.context,
  );
  const evidenceById = new Map([
    ...jobEvidence.map((item) => [item.id, item] as const),
    ...(facts?.evidence ?? []).map((item) => [item.id, item] as const),
  ]);
  const resolve = (references: string[]) =>
    references
      .map((ref) => evidenceById.get(ref))
      .filter((item): item is NonNullable<typeof item> => Boolean(item));

  const understanding = input.understandingData?.understanding as {
    coverage?: "complete" | "partial" | "unavailable";
  } | null;
  return {
    ...input.assessment,
    understandingCoverage: understanding?.coverage ?? "unavailable",
    semanticAlignment: input.assessment.semanticAlignment
      ? {
          ...input.assessment.semanticAlignment,
          jobEvidence: resolve(
            input.assessment.semanticAlignment.jobEvidenceRefs,
          ),
          profileEvidence: resolve(
            input.assessment.semanticAlignment.profileEvidenceRefs,
          ),
        }
      : undefined,
    requirements: input.assessment.requirements?.map((item) => ({
      ...item,
      jobEvidence: resolve(item.jobEvidenceRefs),
      profileEvidence: resolve(item.profileEvidenceRefs),
    })),
    gaps: input.assessment.gaps?.map((item) => ({
      ...item,
      jobEvidence: resolve(item.jobEvidenceRefs),
      profileEvidence: resolve(item.profileEvidenceRefs),
    })),
  };
}
