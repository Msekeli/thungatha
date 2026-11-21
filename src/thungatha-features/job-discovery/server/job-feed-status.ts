export type FeedMatchStatus =
  | "no_assessment"
  | "processing"
  | "failed"
  | "stale"
  | "no_confirmed_profile"
  | "error"
  | "match"
  | "relevant"
  | "unclassified";

export type AssessmentRecord = {
  hash: string;
  classification: "match" | "relevant" | "unclassified";
};

export function resolveJobMatchStatus(input: {
  hasError: boolean;
  profileConfirmed: boolean;
  currentHash: string;
  assessment?: AssessmentRecord;
  queueStatus?: "pending" | "processing" | "failed" | "completed" | null;
}): { matchStatus: FeedMatchStatus; matchClassification?: "match" | "relevant" | "unclassified" } {
  if (input.hasError) {
    return { matchStatus: "error" };
  }
  if (!input.profileConfirmed) {
    return { matchStatus: "no_confirmed_profile" };
  }
  if (input.assessment) {
    if (input.assessment.hash === input.currentHash) {
      const classification = input.assessment.classification;
      return {
        matchStatus: classification,
        matchClassification: classification,
      };
    }
    return { matchStatus: "stale" };
  }
  if (input.queueStatus === "pending" || input.queueStatus === "processing") {
    return { matchStatus: "processing" };
  }
  if (input.queueStatus === "failed") {
    return { matchStatus: "failed" };
  }
  return { matchStatus: "no_assessment" };
}
