import { Skeleton } from "@/components/ui/skeleton";
import type { CvSuggestion } from "../server/cv-studio-schema";

export function CvAiSuggestionContent({
  proposal,
  generating,
  hasCompletedReview,
}: {
  proposal: CvSuggestion | undefined;
  generating: boolean;
  hasCompletedReview: boolean;
}) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto rounded-xl border border-line bg-panel-2 p-3">
      {generating ? (
        <div className="space-y-2" role="status" aria-label="Updating this CV section">
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-11/12" />
          <Skeleton className="h-3.5 w-4/5" />
        </div>
      ) : proposal ? (
        <>
          <p className="whitespace-pre-wrap text-sm leading-5 text-fg">{proposal.proposedText}</p>
          {proposal.reason && (
            <p className="mt-2 whitespace-pre-wrap border-t border-line pt-2 text-xs leading-4 text-fg-muted">
              {proposal.reason}
            </p>
          )}
        </>
      ) : (
        <p className="text-sm text-fg-muted">
          {hasCompletedReview
            ? "No change was recommended. The original CV content is unchanged."
            : "Your proposed update will appear here."}
        </p>
      )}
    </div>
  );
}
