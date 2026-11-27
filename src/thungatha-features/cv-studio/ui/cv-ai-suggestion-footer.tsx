import { Button } from "@/components/ui/button";

type CvAiSuggestionFooterProps = {
  disabled: boolean;
  generating: boolean;
  generationError: string | null;
  pending: boolean;
  rejected: boolean;
  hasCompletedReview: boolean;
  onClose: () => void;
  onRegenerate: () => void;
};

export function CvAiSuggestionFooter({
  disabled,
  generating,
  generationError,
  pending,
  rejected,
  hasCompletedReview,
  onClose,
  onRegenerate,
}: CvAiSuggestionFooterProps) {
  return (
    <>
      {generationError && (
        <p className="text-xs text-destructive" role="alert">
          {generationError}
        </p>
      )}
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={disabled || generating}
          onClick={onClose}
        >
          Close
        </Button>
        <div className="flex flex-wrap justify-end gap-2">
          {rejected && !pending && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={disabled || generating}
              onClick={onRegenerate}
            >
              Generate again
            </Button>
          )}
          {!pending && !rejected && generationError && (
            <Button
              type="button"
              size="sm"
              disabled={disabled || generating}
              onClick={onRegenerate}
            >
              Try again
            </Button>
          )}
          {!pending && !rejected && hasCompletedReview && !generationError && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={disabled || generating}
              onClick={onRegenerate}
            >
              Generate another
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
