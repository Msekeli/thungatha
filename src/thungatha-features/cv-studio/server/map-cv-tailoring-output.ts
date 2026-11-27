import type { CvSuggestion } from "./cv-studio-schema";
import type { CvTailoringEvidence } from "./cv-tailoring-evidence";
import type { CvTailoringModelOutput } from "./cv-tailoring-schema";
import {
  createTailoringEvidenceMap,
  mapTailoringSuggestion,
  type TailoringRequirement,
} from "./cv-tailoring-suggestion-mapper";

export function mapCvTailoringOutput(
  parsed: CvTailoringModelOutput,
  profileEvidence: CvTailoringEvidence["profileEvidence"],
  jobEvidence: Array<{ id: string; content: string }>,
  editableTargets: CvTailoringEvidence["editableTargets"],
  requirements: TailoringRequirement[],
) {
  const targetMap = new Map(editableTargets.map((item) => [item.path, item]));
  const evidenceMap = createTailoringEvidenceMap(profileEvidence, jobEvidence);
  const seenTargets = new Set<string>();
  const suggestions: CvSuggestion[] = parsed.suggestions.map((item) =>
    mapTailoringSuggestion(
      item,
      targetMap,
      evidenceMap,
      requirements,
      seenTargets,
      true,
    ),
  );
  const gaps = parsed.gaps.map((gap) => {
    const requirement = requirements.find(
      (item) => item.id === gap.requirementId,
    );
    if (!requirement)
      throw new Error("AI returned an unknown job requirement.");
    const allowedJobRefs = new Set(requirement.sourceEvidenceRefs ?? []);
    if (gap.jobEvidenceRefs.some((ref) => !allowedJobRefs.has(ref))) {
      throw new Error(
        "AI cited job evidence that is not attached to the unsupported requirement.",
      );
    }
    return {
      requirement: requirement.statement,
      explanation: gap.explanation,
      jobEvidenceRefs: gap.jobEvidenceRefs,
    };
  });
  return {
    suggestions,
    gaps,
    coveredRequirementIds: parsed.coveredRequirementIds,
  };
}

export { mapCvSectionTailoringOutput } from "./map-cv-section-tailoring-output";
