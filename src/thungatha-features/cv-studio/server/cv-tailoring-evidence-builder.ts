import type { CvTailoringEvidence } from "./cv-tailoring-evidence";

export function createCvTailoringEvidenceBuilder() {
  const profileEvidence: CvTailoringEvidence["profileEvidence"] = [];
  const editableTargets: CvTailoringEvidence["editableTargets"] = [];
  const evidenceIds = new Set<string>();

  function addEvidence(path: string, value: string | null | undefined) {
    if (!value?.trim()) return;
    const id = `cv:${path}`;
    profileEvidence.push({ id, content: value.trim() });
    evidenceIds.add(id);
  }

  function addTarget(path: string, value: string | null, evidencePath = path) {
    const profileEvidenceRef = `cv:${evidencePath}`;
    editableTargets.push({
      path,
      currentText: value,
      profileEvidenceRef: evidenceIds.has(profileEvidenceRef)
        ? profileEvidenceRef
        : null,
    });
  }

  return {
    addEvidence,
    addTarget,
    build: () => ({ profileEvidence, editableTargets }),
  };
}
