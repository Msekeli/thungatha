import { Button } from "@/components/ui/button";
import type { CvDraftContent } from "./cv-draft-content";

type Experience = CvDraftContent["workExperience"][number];
type CvDraftExperienceCardHeaderProps = {
  item: Experience;
  isTailoring: boolean;
  isReviewing: boolean;
  disabled: boolean;
  canUndo: boolean;
  onUndo: () => void;
  onTailor: () => void;
};

export function CvDraftExperienceCardHeader({
  item,
  isTailoring,
  isReviewing,
  disabled,
  canUndo,
  onUndo,
  onTailor,
}: CvDraftExperienceCardHeaderProps) {
  return (
    <div className="shrink-0">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="min-w-0 text-sm font-semibold sm:text-base">
          {item.jobTitle}
        </h4>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {canUndo && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={disabled}
              onClick={onUndo}
            >
              Undo
            </Button>
          )}
          {!isReviewing && (
            <Button
              type="button"
              size="sm"
              disabled={disabled || isTailoring}
              onClick={onTailor}
            >
              {isTailoring ? "Tailoring…" : "Tailor this experience"}
            </Button>
          )}
        </div>
      </div>
      <p className="mt-1 text-xs text-fg-muted sm:text-sm">
        {item.employer}
        {item.location ? ` · ${item.location}` : ""}
      </p>
      <p className="mt-1 text-[11px] text-fg-muted sm:text-xs">
        {item.startDate} – {item.isCurrent ? "Present" : (item.endDate ?? "—")}
      </p>
    </div>
  );
}
