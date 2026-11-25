import type { CvTailoringEvidence } from "./cv-tailoring-evidence";

export type TailoringEvidenceMap = Map<
  string,
  { source: "profile" | "job"; excerpt: string }
>;

export function createTailoringEvidenceMap(
  profileEvidence: CvTailoringEvidence["profileEvidence"],
  jobEvidence: Array<{ id: string; content: string }>,
): TailoringEvidenceMap {
  return new Map([
    ...profileEvidence.map((item) => [
      item.id,
      { source: "profile" as const, excerpt: item.content },
    ] as const),
    ...jobEvidence.map((item) => [
      item.id,
      { source: "job" as const, excerpt: item.content },
    ] as const),
  ]);
}
