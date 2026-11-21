import type { JobUnderstanding, MatchAssessmentInput } from "./job-ai-schemas";

export type MatchClassification = "match" | "relevant" | "unclassified";
export type MatchAssessment = MatchAssessmentInput & { classification: MatchClassification };

export function validateAndClassifyAssessment(
  assessment: MatchAssessmentInput,
  understanding: JobUnderstanding,
  allowedJobRefs: Set<string>,
  allowedProfileRefs: Set<string>,
): MatchAssessment {
  const extracted = new Map(understanding.requirements.map((item) => [item.id, item]));
  if (extracted.size !== understanding.requirements.length) {
    throw new Error("Extracted job requirements contain duplicate identifiers.");
  }
  const assessedIds = new Set<string>();
  for (const item of assessment.requirements) {
    const source = extracted.get(item.id);
    if (!source || assessedIds.has(item.id) || source.importance !== item.importance) {
      throw new Error("AI assessment requirements do not match the extracted job requirements.");
    }
    assessedIds.add(item.id);
  }
  if (assessedIds.size !== extracted.size) {
    throw new Error("AI assessment omitted one or more extracted job requirements.");
  }

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
  const hasUnmetMandatory = assessment.requirements.some(
    (item) => item.importance === "mandatory" && item.assessment !== "supported",
  );
  const classification: MatchClassification = level === "insufficient" || !assessment.semanticAlignment.profileEvidenceRefs.length
    ? "unclassified"
    : level === "meaningful" || materialGaps || hasContradiction || hasUnmetMandatory ? "relevant" : "match";

  return { ...assessment, classification };
}
