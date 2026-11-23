export type FeedJob = {
  id: string;
  published_at?: string | null;
  updated_at?: string | null;
  description?: string | null;
  title?: string | null;
  employer_name?: string | null;
  location_text?: string | null;
  matchClassification?: "match" | "relevant";
  matchStatus?: "no_assessment" | "processing" | "failed" | "stale" | "no_confirmed_profile" | "error" | "unavailable" | "match" | "relevant";
  [key: string]: unknown;
};

export function newestFirst(a: FeedJob, b: FeedJob) {
  const aPublished = a.published_at ? Date.parse(a.published_at) : NaN;
  const bPublished = b.published_at ? Date.parse(b.published_at) : NaN;
  if (Number.isFinite(aPublished) && Number.isFinite(bPublished) && aPublished !== bPublished) return bPublished - aPublished;
  if (Number.isFinite(aPublished) !== Number.isFinite(bPublished)) return Number.isFinite(aPublished) ? -1 : 1;
  const aUpdated = a.updated_at ? Date.parse(a.updated_at) : NaN;
  const bUpdated = b.updated_at ? Date.parse(b.updated_at) : NaN;
  if (Number.isFinite(aUpdated) && Number.isFinite(bUpdated) && aUpdated !== bUpdated) return bUpdated - aUpdated;
  return a.id.localeCompare(b.id);
}

export function relevanceOrder(a: FeedJob, b: FeedJob) {
  const rank = (value: FeedJob["matchClassification"]) => value === "match" ? 0 : value === "relevant" ? 1 : 2;
  return rank(a.matchClassification) - rank(b.matchClassification) || newestFirst(a, b);
}
