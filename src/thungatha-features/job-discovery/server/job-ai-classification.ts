import type { JobUnderstanding, MatchAssessmentInput } from "./job-ai-schemas";

export type MatchClassification = "match" | "relevant";
export const MATCH_CLASSIFICATION_POLICY_VERSION = "m3-classification-v3";

export class AssessmentUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AssessmentUnavailableError";
  }
}

export type MatchAssessment = MatchAssessmentInput & {
  classification: MatchClassification;
  classificationPolicyVersion: string;
};

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
    if (item.requirement !== source.statement) {
      throw new Error(`AI assessment changed the extracted wording for requirement "${item.id}".`);
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

  if (
    assessment.semanticAlignment.level === "insufficient"
    || assessment.semanticAlignment.profileEvidenceRefs.length === 0
  ) {
    throw new AssessmentUnavailableError(
      "There is insufficient confirmed Profile evidence to classify this job.",
    );
  }

  const contradictoryEvidence = assessment.requirements.some((item) => item.assessment === "contradictory");
  const unsupportedMandatory = assessment.requirements.some(
    (item) => item.importance === "mandatory" && item.assessment !== "supported",
  );

  const classification: MatchClassification =
    assessment.semanticAlignment.level === "strong"
    && !assessment.semanticAlignment.materialGaps
    && !contradictoryEvidence
    && !unsupportedMandatory
    && understanding.coverage === "complete"
      ? "match"
      : "relevant";

  return {
    ...assessment,
    classification,
    classificationPolicyVersion: MATCH_CLASSIFICATION_POLICY_VERSION,
  };
}
