"use client";

import { Button } from "@/components/ui/button";
import { CvAiSuggestions } from "./cv-ai-suggestions";
import type { CvSuggestion } from "../server/cv-studio-schema";

type CvDraftSummarySectionProps = {
  summary: string;
  suggestions: CvSuggestion[];
  hasCompletedReview: boolean;
  reviewOpen: boolean;
  generating: boolean;
  generationError: string | null;
  disabled: boolean;
  canUndo: boolean;
  error: string | null;
  onReviewOpenChange: (open: boolean) => void;
  onDecision: (id: string, decision: "accepted" | "rejected") => void;
  onRegenerate: () => void;
  onUndo: () => void;
  onTailor: () => void;
};

export function CvDraftSummarySection({
  summary, suggestions, hasCompletedReview, reviewOpen, generating,
  generationError, disabled, canUndo, error, onReviewOpenChange,
  onDecision, onRegenerate, onUndo, onTailor,
}: CvDraftSummarySectionProps) {
  const pending = suggestions.some((item) => item.decision === "pending");

  return (
    <div className="flex h-full min-h-0 flex-col gap-2 text-fg">
      <div className="shrink-0">
        <h3 className="text-base font-bold sm:text-lg">Professional Summary</h3>
        <p className="text-xs text-fg-muted sm:text-sm">
          Review the current wording, then generate a job-specific proposal when ready.
        </p>
      </div>
      <section className="flex min-h-0 flex-1 flex-col overflow-y-auto rounded-xl border border-line bg-panel-2 p-3 sm:p-4">
        {reviewOpen ? (
          <CvAiSuggestions
            open={reviewOpen}
            onOpenChange={onReviewOpenChange}
            suggestions={suggestions}
            hasCompletedReview={hasCompletedReview}
            generating={generating}
            generationError={generationError}
            disabled={disabled}
            onAccept={(id) => onDecision(id, "accepted")}
            onReject={(id) => onDecision(id, "rejected")}
            onRegenerate={onRegenerate}
            onDiscard={() => onReviewOpenChange(false)}
          />
        ) : (
          <>
            <div className="flex shrink-0 flex-wrap items-center justify-between gap-2">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-fg-muted">
                Current summary
              </h4>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                {canUndo && (
                  <Button type="button" size="sm" variant="outline" disabled={disabled} onClick={onUndo}>
                    Undo
                  </Button>
                )}
                <Button type="button" size="sm" disabled={disabled || generating} onClick={onTailor}>
                  {pending ? "Review suggestion" : suggestions.length ? "Generate another version" : "Tailor summary"}
                </Button>
              </div>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-5 text-fg">
              {summary || "No professional summary is available in the master CV."}
            </p>
          </>
        )}
      </section>
      {error && <p className="shrink-0 text-xs text-destructive" role="alert">{error}</p>}
    </div>
  );
}
