import { Button } from "@/components/ui/button";
import { CvAiSuggestions } from "./cv-ai-suggestions";
import type { CvSuggestion } from "../server/cv-studio-schema";

type Experience = {
  sourceId: string;
  jobTitle: string;
  employer: string;
  location: string | null;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
  description: string | null;
};
type CvDraftExperienceCardProps = {
  item: Experience;
  suggestions: CvSuggestion[];
  isTailoring: boolean;
  isReviewing: boolean;
  hasCompletedReview: boolean;
  tailoringError: string | null;
  disabled: boolean;
  canUndo: boolean;
  onUndo: () => void;
  onTailor: () => void;
  onReviewOpenChange: (open: boolean) => void;
  onDecision: (id: string, decision: "accepted" | "rejected") => void;
  onRegenerate: () => void;
};

export function CvDraftExperienceCard({
  item, suggestions, isTailoring, isReviewing, hasCompletedReview,
  tailoringError, disabled, canUndo, onUndo, onTailor,
  onReviewOpenChange, onDecision, onRegenerate,
}: CvDraftExperienceCardProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-line bg-panel-2 p-3 text-fg sm:p-4">
      <div className="shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="min-w-0 text-sm font-semibold sm:text-base">{item.jobTitle}</h4>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {canUndo && (
              <Button type="button" size="sm" variant="outline" disabled={disabled} onClick={onUndo}>
                Undo
              </Button>
            )}
            {!isReviewing && (
              <Button type="button" size="sm" disabled={disabled || isTailoring} onClick={onTailor}>
                {isTailoring ? "Tailoring…" : "Tailor this experience"}
              </Button>
            )}
          </div>
        </div>
        <p className="mt-1 text-xs text-fg-muted sm:text-sm">
          {item.employer}{item.location ? ` · ${item.location}` : ""}
        </p>
        <p className="mt-1 text-[11px] text-fg-muted sm:text-xs">
          {item.startDate} – {item.isCurrent ? "Present" : (item.endDate ?? "—")}
        </p>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto pt-3">
        {isReviewing ? (
          <CvAiSuggestions
            open={isReviewing}
            onOpenChange={onReviewOpenChange}
            suggestions={suggestions}
            hasCompletedReview={hasCompletedReview}
            generating={isTailoring}
            generationError={tailoringError}
            disabled={disabled}
            onAccept={(id) => onDecision(id, "accepted")}
            onReject={(id) => onDecision(id, "rejected")}
            onRegenerate={onRegenerate}
            onDiscard={() => onReviewOpenChange(false)}
          />
        ) : (
          <section>
            <h5 className="text-[10px] font-semibold uppercase tracking-wide text-fg-muted sm:text-xs">
              Original responsibilities / description
            </h5>
            <p className="mt-1 whitespace-pre-wrap text-xs leading-4 sm:text-sm sm:leading-5">
              {item.description || "No description provided."}
            </p>
          </section>
        )}
      </div>
    </div>
  );
}
