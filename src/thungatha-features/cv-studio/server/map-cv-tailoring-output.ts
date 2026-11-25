import { cvSuggestionSchema, type CvSuggestion } from "./cv-studio-schema";
import type { CvTailoringEvidence } from "./cv-tailoring-evidence";
import type { CvTailoringModelOutput } from "./cv-tailoring-schema";

export function mapCvTailoringOutput(
  parsed: CvTailoringModelOutput,
  profileEvidence: CvTailoringEvidence["profileEvidence"],
  jobEvidence: Array<{ id: string; content: string }>,
  editableTargets: CvTailoringEvidence["editableTargets"],
  requirements: Array<{
    id: string;
    statement: string;
    sourceEvidenceRefs?: string[];
  }>,
) {
  const targetMap = new Map(editableTargets.map((item) => [item.path, item]));
  const evidenceMap = new Map<
    string,
    { source: "profile" | "job"; excerpt: string }
  >([
    ...profileEvidence.map(
      (item) =>
        [
          item.id,
          { source: "profile" as const, excerpt: item.content },
        ] as const,
    ),
    ...jobEvidence.map(
      (item) =>
        [item.id, { source: "job" as const, excerpt: item.content }] as const,
    ),
  ]);
  const seenTargets = new Set<string>();
  const suggestions: CvSuggestion[] = parsed.suggestions.map((item) => {
    if (seenTargets.has(item.targetPath)) {
      throw new Error(
        "AI returned more than one suggestion for the same CV field.",
      );
    }
    seenTargets.add(item.targetPath);
    const target = targetMap.get(item.targetPath);
    if (!target || item.originalText !== target.currentText) {
      throw new Error(
        "AI returned a suggestion for changed or unknown CV text.",
      );
    }
    if (item.targetPath === "professionalSummary") {
      if (
        item.profileEvidenceRefs.length === 0 ||
        item.profileEvidenceRefs.some(
          (ref) => !profileEvidence.some((evidence) => evidence.id === ref),
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
    const suggestion = {
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
      decision: "pending" as const,
    };

    // Apply the same CV suggestion contract used by persisted CV versions.
    // The AI response schema validates provider output; this validates the
    // actual application-facing object after evidence has been resolved.
    return cvSuggestionSchema.parse(suggestion);
  });
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

export function mapCvSectionTailoringOutput(
  parsed: import("./cv-tailoring-schema").CvSectionTailoringModelOutput,
  profileEvidence: CvTailoringEvidence["profileEvidence"],
  jobEvidence: Array<{ id: string; content: string }>,
  editableTargets: CvTailoringEvidence["editableTargets"],
  requirements: Array<{
    id: string;
    statement: string;
    sourceEvidenceRefs?: string[];
  }>,
) {
  const targetMap = new Map(editableTargets.map((item) => [item.path, item]));
  const evidenceMap = new Map<
    string,
    { source: "profile" | "job"; excerpt: string }
  >([
    ...profileEvidence.map(
      (item) =>
        [
          item.id,
          { source: "profile" as const, excerpt: item.content },
        ] as const,
    ),
    ...jobEvidence.map(
      (item) =>
        [item.id, { source: "job" as const, excerpt: item.content }] as const,
    ),
  ]);
  const seenTargets = new Set<string>();
  const suggestions: CvSuggestion[] = parsed.suggestions.map((item) => {
    if (seenTargets.has(item.targetPath)) {
      throw new Error(
        "AI returned more than one suggestion for the same CV field.",
      );
    }
    seenTargets.add(item.targetPath);
    const target = targetMap.get(item.targetPath);
    if (!target || item.originalText !== target.currentText) {
      throw new Error(
        "AI returned a suggestion for changed or unknown CV text.",
      );
    }
    if (
      !target.profileEvidenceRef ||
      item.profileEvidenceRefs.length !== 1 ||
      item.profileEvidenceRefs[0] !== target.profileEvidenceRef
    ) {
      throw new Error(
        "AI suggestion must cite only the exact source evidence for its CV field.",
      );
    }
    if (!item.requirementIds.length) {
      throw new Error(
        "AI suggestion must be linked to a specific job requirement.",
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
  });
  return { suggestions };
}
