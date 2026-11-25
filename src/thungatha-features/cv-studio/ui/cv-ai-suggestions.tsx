"use client";

import type { CvSuggestion } from "../server/cv-studio-schema";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function CvAiSuggestions({
  open, onOpenChange, suggestions, hasCompletedReview, generating,
  generationError, disabled, onAccept, onReject, onRegenerate, onDiscard,
}: {
  open: boolean; onOpenChange: (open: boolean) => void; suggestions: CvSuggestion[];
  hasCompletedReview: boolean; generating: boolean; generationError: string | null; disabled: boolean;
  onAccept: (id: string) => void; onReject: (id: string) => void;
  onRegenerate: () => void; onDiscard: () => void;
}) {
  const pending = suggestions.find((item) => item.decision === "pending");
  const rejected = [...suggestions].reverse().find((item) => item.decision === "rejected");
  const accepted = [...suggestions].reverse().find((item) => item.decision === "accepted");
  const proposal = pending ?? rejected ?? accepted;

  if (!open && !generating) return null;

  return (
    <section className="flex min-h-0 flex-1 flex-col gap-4" aria-live="polite">
      <div className="flex items-center gap-2 rounded-xl border border-accent/30 bg-accent-bg px-4 py-3 text-sm font-semibold text-accent-text">
        <span aria-hidden="true" className="text-lg">✓</span>
        {generating ? "Preparing your suggested update" : proposal ? "1 change suggested" : "No change suggested"}
      </div>

      <div className="min-h-0 flex-1 space-y-3">
        <h4 className="text-base font-semibold text-fg">Suggested update</h4>
        {generating ? (
          <div className="space-y-2 rounded-xl border border-line bg-panel-2 p-4" role="status" aria-label="Generating suggested CV update">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ) : proposal ? (
          <p className="rounded-xl border border-accent/30 bg-panel-2 p-4 text-sm leading-6 text-fg">
            {proposal.proposedText}
          </p>
        ) : (
          <p className="rounded-xl border border-line bg-panel-2 p-4 text-sm text-fg-muted">
            {hasCompletedReview ? "No change was recommended for this section. Your original content remains unchanged." : "Your suggested update will appear here."}
          </p>
        )}

        <div className="rounded-xl border border-line bg-panel-2 p-4">
          <h5 className="text-sm font-semibold text-fg">ⓘ Why this is recommended</h5>
          {generating ? (
            <div className="mt-2 space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
            </div>
          ) : (
            <p className="mt-1 text-sm leading-6 text-fg-muted">
              {proposal?.reason ?? (generationError ? "The suggestion could not be generated." : "The AI explanation will appear here with the suggested update.")}
            </p>
          )}
        </div>
      </div>

      {generationError && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive" role="alert">
          {generationError}
        </p>
      )}

      <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
        <Button type="button" variant="outline" disabled={disabled || generating} onClick={() => { onDiscard(); onOpenChange(false); }}>
          Skip (No change)
        </Button>
        <div className="flex flex-wrap justify-end gap-2">
          {pending && (
            <>
              <Button type="button" variant="outline" disabled={disabled} onClick={() => { onReject(pending.id); onOpenChange(false); }}>Reject</Button>
              <Button type="button" disabled={disabled} onClick={() => { onAccept(pending.id); onOpenChange(false); }}>✓ Accept and apply</Button>
            </>
          )}
          {rejected && !pending && (
            <Button type="button" variant="outline" disabled={disabled} onClick={onRegenerate}>Generate again</Button>
          )}
          {!pending && !rejected && generationError && (
            <Button type="button" disabled={disabled || generating} onClick={onRegenerate}>Try again</Button>
          )}
          {!pending && !rejected && hasCompletedReview && !generationError && (
            <Button type="button" variant="outline" disabled={disabled || generating} onClick={onRegenerate}>Generate another proposal</Button>
          )}
        </div>
      </footer>
    </section>
  );
}
