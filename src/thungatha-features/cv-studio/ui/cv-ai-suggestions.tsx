"use client";

import { Button } from "@/components/ui/button";
import type { CvSuggestion } from "../server/cv-studio-schema";
import { CvAiSuggestionContent } from "./cv-ai-suggestion-content";
import { CvAiSuggestionFooter } from "./cv-ai-suggestion-footer";

export function CvAiSuggestions({
  open,
  onOpenChange,
  suggestions,
  hasCompletedReview,
  generating,
  generationError,
  disabled,
  onAccept,
  onReject,
  onRegenerate,
  onDiscard,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  suggestions: CvSuggestion[];
  hasCompletedReview: boolean;
  generating: boolean;
  generationError: string | null;
  disabled: boolean;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onRegenerate: () => void;
  onDiscard: () => void;
}) {
  const pending = suggestions.find((item) => item.decision === "pending");
  const rejected = [...suggestions]
    .reverse()
    .find((item) => item.decision === "rejected");
  const proposal =
    pending ??
    rejected ??
    [...suggestions].reverse().find((item) => item.decision === "accepted");

  if (!open && !generating) return null;

  return (
    <section className="flex min-h-0 flex-1 flex-col gap-2" aria-live="polite">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <h4 className="text-sm font-semibold text-fg">AI suggested update</h4>
          <span className="text-xs font-medium text-fg-muted">
            {generating
              ? "Updating…"
              : proposal
                ? "Ready to review"
                : "No change suggested"}
          </span>
        </div>
        {pending && (
          <div className="flex shrink-0 gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={disabled || generating}
              onClick={() => {
                onReject(pending.id);
                onOpenChange(false);
              }}
            >
              Reject
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={disabled || generating}
              onClick={() => {
                onAccept(pending.id);
                onOpenChange(false);
              }}
            >
              Accept and apply
            </Button>
          </div>
        )}
      </div>
      <CvAiSuggestionContent
        proposal={proposal}
        generating={generating}
        hasCompletedReview={hasCompletedReview}
      />
      <CvAiSuggestionFooter
        disabled={disabled}
        generating={generating}
        generationError={generationError}
        pending={Boolean(pending)}
        rejected={Boolean(rejected)}
        hasCompletedReview={hasCompletedReview}
        onClose={() => {
          onDiscard();
          onOpenChange(false);
        }}
        onRegenerate={onRegenerate}
      />
    </section>
  );
}
