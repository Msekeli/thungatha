import type { CvSuggestion } from "./cv-studio-schema";
import type { CvTailoringEvidence } from "./cv-tailoring-evidence";
import type { CvTailoringModelOutput } from "./cv-tailoring-schema";

export function mapCvTailoringOutput(
  parsed: CvTailoringModelOutput,
  profileEvidence: CvTailoringEvidence["profileEvidence"],
  jobEvidence: Array<{ id: string; content: string }>,
  editableTargets: CvTailoringEvidence["editableTargets"],
  requirements: Array<{ id: string; statement: string }>,
) {
  const targetMap = new Map(editableTargets.map((item) => [item.path, item]));
  const evidenceMap = new Map([
    ...profileEvidence.map((item) => [item.id, { source: "profile" as const, excerpt: item.content }] as const),
    ...jobEvidence.map((item) => [item.id, { source: "job" as const, excerpt: item.content }] as const),
  ]);
  const seenTargets = new Set<string>();
  const suggestions: CvSuggestion[] = parsed.suggestions.map((item) => {
    if (seenTargets.has(item.targetPath)) {
      throw new Error("AI returned more than one suggestion for the same CV field.");
    }
    seenTargets.add(item.targetPath);
    const target = targetMap.get(item.targetPath);
    if (!target || item.originalText !== target.currentText) {
      throw new Error("AI returned a suggestion for changed or unknown CV text.");
    }
    const evidenceRefs = [...item.profileEvidenceRefs, ...item.jobEvidenceRefs];
    return {
      id: crypto.randomUUID(),
      targetPath: item.targetPath,
      originalText: item.originalText,
      proposedText: item.proposedText,
      reason: item.reason,
      evidenceRefs,
      evidence: evidenceRefs.map((ref) => {
        const evidence = evidenceMap.get(ref);
        if (!evidence) throw new Error("AI returned an unknown evidence reference.");
        return { ref, ...evidence };
      }),
      decision: "pending",
    };
  });
  const gaps = parsed.gaps.map((gap) => {
    const requirement = requirements.find((item) => item.id === gap.requirementId);
    if (!requirement) throw new Error("AI returned an unknown job requirement.");
    return {
      requirement: requirement.statement,
      explanation: gap.explanation,
      jobEvidenceRefs: gap.jobEvidenceRefs,
    };
  });
  return { suggestions, gaps };
}
