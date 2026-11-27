import type { TailoringSuggestionInput } from "./cv-tailoring-suggestion-mapper";
import type { CvTailoringReview } from "./cv-tailoring-verification-schema";

export function retainApprovedSuggestions(
  suggestions: TailoringSuggestionInput[],
  reviews: CvTailoringReview["reviews"],
) {
  if (reviews.some((review) => review.index >= suggestions.length)) {
    throw new Error(
      "CV tailoring verification returned an unknown suggestion.",
    );
  }
  const byIndex = new Map(reviews.map((review) => [review.index, review]));
  if (
    byIndex.size !== suggestions.length ||
    suggestions.some((_, index) => !byIndex.has(index))
  ) {
    throw new Error(
      "CV tailoring verification did not review every suggestion exactly once.",
    );
  }
  return suggestions.filter(
    (_, index) => byIndex.get(index)?.decision === "approve",
  );
}
