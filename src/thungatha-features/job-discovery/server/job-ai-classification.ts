import type { MatchAssessmentInput } from "./job-ai-schemas";

export type MatchClassification = "match" | "relevant" | "unclassified";
export type MatchAssessment = MatchAssessmentInput & { classification: MatchClassification };

export function validateAndClassifyAssessment(
  assessment: MatchAssessmentInput, allowedJobRefs: Set<string>, allowedProfileRefs: Set<string>,
): MatchAssessment {
  const jobReferences = [
    ...assessment.semanticAlignment.jobEvidenceRefs,
    ...assessment.requirements.flatMap((item) => item.jobEvidenceRefs),
    ...assessment.gaps.flatMap((item) => item.jobEvidenceRefs),
  ];
  const profileReferences = [
    ...assessment.semanticAlignment.profileEvidenceRefs,
    ...assessment.requirements.flatMap((item) => item.profileEvidenceRefs),
    ...assessment.gaps.flatMap((item) => item.profileEvidenceRefs),
  ];
  if (jobReferences.some((ref) => !allowedJobRefs.has(ref)) || profileReferences.some((ref) => !allowedProfileRefs.has(ref))) {
    throw new Error("AI assessment referenced evidence outside the supplied job description or confirmed Profile.");
  }

  const { level, materialGaps } = assessment.semanticAlignment;
  const hasContradiction = assessment.requirements.some((item) => item.assessment === "contradictory");
  const classification: MatchClassification = level === "insufficient" || !assessment.semanticAlignment.profileEvidenceRefs.length
    ? "unclassified"
    : level === "meaningful" || materialGaps || hasContradiction ? "relevant" : "match";

  return { ...assessment, classification };
}
