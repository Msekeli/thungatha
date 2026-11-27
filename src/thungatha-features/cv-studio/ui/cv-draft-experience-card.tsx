import type { CvSuggestion } from "../server/cv-studio-schema";
import { CvAiSuggestions } from "./cv-ai-suggestions";
import type { CvDraftContent } from "./cv-draft-content";
import { CvDraftExperienceCardHeader } from "./cv-draft-experience-card-header";

type CvDraftExperienceCardProps = {
  item: CvDraftContent["workExperience"][number];
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
  item,
  suggestions,
  isTailoring,
  isReviewing,
  hasCompletedReview,
  tailoringError,
  disabled,
  canUndo,
  onUndo,
  onTailor,
  onReviewOpenChange,
  onDecision,
  onRegenerate,
}: CvDraftExperienceCardProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-line bg-panel-2 p-3 text-fg sm:p-4">
      <CvDraftExperienceCardHeader
        item={item}
        isTailoring={isTailoring}
        isReviewing={isReviewing}
        disabled={disabled}
        canUndo={canUndo}
        onUndo={onUndo}
        onTailor={onTailor}
      />
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
