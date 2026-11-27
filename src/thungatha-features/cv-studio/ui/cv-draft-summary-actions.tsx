import { Button } from "@/components/ui/button";

type CvDraftSummaryActionsProps = {
  disabled: boolean;
  generating: boolean;
  pending: boolean;
  hasSuggestions: boolean;
  canUndo: boolean;
  onUndo: () => void;
  onTailor: () => void;
};

export function CvDraftSummaryActions({
  disabled,
  generating,
  pending,
  hasSuggestions,
  canUndo,
  onUndo,
  onTailor,
}: CvDraftSummaryActionsProps) {
  return (
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
      <Button
        type="button"
        size="sm"
        disabled={disabled || generating}
        onClick={onTailor}
      >
        {pending
          ? "Review suggestion"
          : hasSuggestions
            ? "Generate another version"
            : "Tailor summary"}
      </Button>
    </div>
  );
}
