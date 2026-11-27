import type { JobUnderstanding } from "@/thungatha-features/job-discovery/server/job-ai-schemas";
import type { CvEvidence } from "./cv-tailoring-service-types";

const STOP_WORDS = new Set([
  "about",
  "after",
  "also",
  "and",
  "are",
  "based",
  "been",
  "being",
  "can",
  "candidate",
  "demonstrate",
  "demonstrated",
  "experience",
  "from",
  "have",
  "into",
  "job",
  "more",
  "must",
  "role",
  "should",
  "that",
  "their",
  "them",
  "there",
  "these",
  "this",
  "through",
  "using",
  "with",
  "within",
  "work",
]);

function evidenceTerms(value: string) {
  return new Set(
    value
      .toLowerCase()
      .match(/[a-z0-9+#.]{2,}/g)
      ?.filter((term) => !STOP_WORDS.has(term)) ?? [],
  );
}

export function selectSummaryEvidence(
  evidence: CvEvidence,
  requirements: JobUnderstanding["requirements"],
  maxCharacters = 7_500,
) {
  const terms = evidenceTerms(
    requirements.map((item) => item.statement).join(" "),
  );
  const ranked = evidence
    .map((item, index) => {
      let score = 0;
      for (const term of evidenceTerms(item.content))
        if (terms.has(term)) score++;
      if (item.id === "cv:professionalSummary") score += 3;
      if (item.id === "cv:headline") score += 2;
      if (item.id.startsWith("cv:technicalSkills")) score++;
      return { item, index, score };
    })
    .sort((a, b) => b.score - a.score || a.index - b.index);

  const selected: CvEvidence = [];
  let used = 0;
  for (const { item } of ranked) {
    if (selected.length >= 24 || used >= maxCharacters) break;
    const content = item.content
      .slice(0, Math.min(700, maxCharacters - used))
      .trimEnd();
    if (!content) continue;
    selected.push({ id: item.id, content });
    used += item.id.length + content.length;
  }
  return selected;
}

export function selectJobEvidence(
  evidence: CvEvidence,
  requirements: JobUnderstanding["requirements"],
  maxCharacters = 2_000,
) {
  const byId = new Map(evidence.map((item) => [item.id, item]));
  const refs = [
    ...new Set(requirements.flatMap((item) => item.sourceEvidenceRefs)),
  ].filter((ref) => byId.has(ref));
  if (!refs.length || maxCharacters <= 0) return [];

  const budget = Math.max(
    24,
    Math.min(240, Math.floor(maxCharacters / refs.length)),
  );
  const selected: CvEvidence = [];
  let used = 0;
  for (const ref of refs) {
    const remaining = maxCharacters - used;
    const contentBudget = Math.min(budget, remaining - ref.length - 1);
    if (contentBudget <= 0) break;
    const item = byId.get(ref);
    const content = item?.content.slice(0, contentBudget).trimEnd();
    if (!item || !content) continue;
    selected.push({ id: item.id, content });
    used += item.id.length + content.length;
  }
  return selected;
}
