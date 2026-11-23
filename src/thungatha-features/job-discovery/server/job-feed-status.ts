export type FeedMatchStatus =
  | "no_assessment" | "processing" | "failed" | "stale"
  | "no_confirmed_profile" | "error" | "unavailable" | "match" | "relevant";

export type AssessmentRecord = { hash: string; classification: "match" | "relevant" };

export function resolveJobMatchStatus(input: {
  hasError: boolean;
  profileConfirmed: boolean;
  currentHash: string;
  assessment?: AssessmentRecord;
  queueStatus?: "pending" | "processing" | "failed" | "completed" | "unavailable" | null;
}): { matchStatus: FeedMatchStatus; matchClassification?: "match" | "relevant" } {
  if (input.hasError) return { matchStatus: "error" };
  if (!input.profileConfirmed) return { matchStatus: "no_confirmed_profile" };
  if (input.assessment) {
    if (input.assessment.hash !== input.currentHash) return { matchStatus: "stale" };
    return { matchStatus: input.assessment.classification, matchClassification: input.assessment.classification };
  }
  if (input.queueStatus === "pending" || input.queueStatus === "processing") return { matchStatus: "processing" };
  if (input.queueStatus === "failed") return { matchStatus: "failed" };
  if (input.queueStatus === "unavailable") return { matchStatus: "unavailable" };
  return { matchStatus: "no_assessment" };
}
