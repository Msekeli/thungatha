import { cvSuggestionSchema, type CvSuggestion } from "./cv-studio-schema";
import type { CvTailoringEvidence } from "./cv-tailoring-evidence";
import {
  createTailoringEvidenceMap,
  type TailoringEvidenceMap,
} from "./cv-tailoring-evidence-map";

export type TailoringSuggestionInput = {
  targetPath: string;
  originalText: string | null;
  proposedText: string;
  reason: string;
  profileEvidenceRefs: string[];
  requirementIds: string[];
  jobEvidenceRefs: string[];
};

export type TailoringRequirement = {
  id: string;
  statement: string;
  sourceEvidenceRefs?: string[];
};

export { createTailoringEvidenceMap };

export function mapTailoringSuggestion(
  item: TailoringSuggestionInput,
  targetMap: Map<string, CvTailoringEvidence["editableTargets"][number]>,
  evidenceMap: TailoringEvidenceMap,
  requirements: TailoringRequirement[],
  seenTargets: Set<string>,
  allowSummaryEvidence = false,
): CvSuggestion {
  if (seenTargets.has(item.targetPath)) {
    throw new Error(
      "AI returned more than one suggestion for the same CV field.",
    );
  }
  seenTargets.add(item.targetPath);
  const target = targetMap.get(item.targetPath);
  if (!target || item.originalText !== target.currentText) {
    throw new Error("AI returned a suggestion for changed or unknown CV text.");
  }

  const summaryEvidence =
    allowSummaryEvidence && item.targetPath === "professionalSummary";
  if (summaryEvidence) {
    if (
      item.profileEvidenceRefs.length === 0 ||
      item.profileEvidenceRefs.some(
        (ref) =>
          !evidenceMap.has(ref) || evidenceMap.get(ref)?.source !== "profile",
      )
    ) {
      throw new Error(
        "AI summary suggestion must cite confirmed Profile evidence.",
      );
    }
  } else if (
    !target.profileEvidenceRef ||
    item.profileEvidenceRefs.length !== 1 ||
    item.profileEvidenceRefs[0] !== target.profileEvidenceRef
  ) {
    throw new Error(
      "AI suggestion must cite only the exact source evidence for its CV field.",
    );
  }

  const citedRequirements = item.requirementIds.map((id) => {
    const requirement = requirements.find((candidate) => candidate.id === id);
    if (!requirement)
      throw new Error("AI returned an unknown job requirement.");
    return requirement;
  });
  const allowedJobRefs = new Set(
    citedRequirements.flatMap(
      (requirement) => requirement.sourceEvidenceRefs ?? [],
    ),
  );
  if (item.jobEvidenceRefs.some((ref) => !allowedJobRefs.has(ref))) {
    throw new Error(
      "AI cited job evidence that is not attached to its selected requirement.",
    );
  }

  const evidenceRefs = [...item.profileEvidenceRefs, ...item.jobEvidenceRefs];
  return cvSuggestionSchema.parse({
    id: crypto.randomUUID(),
    targetPath: item.targetPath,
    originalText: item.originalText,
    proposedText: item.proposedText,
    reason: item.reason,
    evidenceRefs,
    evidence: evidenceRefs.map((ref) => {
      const evidence = evidenceMap.get(ref);
      if (!evidence)
        throw new Error("AI returned an unknown evidence reference.");
      return { ref, ...evidence };
    }),
    decision: "pending",
  });
}
