import type { CvSuggestion } from "./cv-studio-schema";
import type { CvTailoringEvidence } from "./cv-tailoring-evidence";
import type { CvSectionTailoringModelOutput } from "./cv-tailoring-schema";
import {
  createTailoringEvidenceMap,
  mapTailoringSuggestion,
  type TailoringRequirement,
} from "./cv-tailoring-suggestion-mapper";

export function mapCvSectionTailoringOutput(
  parsed: CvSectionTailoringModelOutput,
  profileEvidence: CvTailoringEvidence["profileEvidence"],
  jobEvidence: Array<{ id: string; content: string }>,
  editableTargets: CvTailoringEvidence["editableTargets"],
  requirements: TailoringRequirement[],
) {
  const targetMap = new Map(editableTargets.map((item) => [item.path, item]));
  const evidenceMap = createTailoringEvidenceMap(profileEvidence, jobEvidence);
  const seenTargets = new Set<string>();
  const suggestions: CvSuggestion[] = parsed.suggestions.map((item) => {
    if (!item.requirementIds.length) {
      throw new Error(
        "AI suggestion must be linked to a specific job requirement.",
      );
    }
    return mapTailoringSuggestion(
      item,
      targetMap,
      evidenceMap,
      requirements,
      seenTargets,
    );
  });
  return { suggestions };
}
