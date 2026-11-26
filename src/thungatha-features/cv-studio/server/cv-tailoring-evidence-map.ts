import type { CvTailoringEvidence } from "./cv-tailoring-evidence";

type TailoringEvidenceEntry = {
  source: "profile" | "job";
  excerpt: string;
};

export type TailoringEvidenceMap = Map<string, TailoringEvidenceEntry>;

export function createTailoringEvidenceMap(
  profileEvidence: CvTailoringEvidence["profileEvidence"],
  jobEvidence: Array<{ id: string; content: string }>,
): TailoringEvidenceMap {
  const entries: Array<[string, TailoringEvidenceEntry]> = [
    ...profileEvidence.map((item): [string, TailoringEvidenceEntry] => [
      item.id,
      { source: "profile", excerpt: item.content },
    ]),
    ...jobEvidence.map((item): [string, TailoringEvidenceEntry] => [
      item.id,
      { source: "job", excerpt: item.content },
    ]),
  ];
  return new Map(entries);
}
