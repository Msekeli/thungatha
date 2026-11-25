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
    <section className="flex min-h-0 flex-col gap-2" aria-live="polite">
      <div className="flex shrink-0 items-center justify-between gap-2">
        <h4 className="text-sm font-semibold text-fg">AI suggested update</h4>
        <span className="text-xs font-medium text-fg-muted">
          {generating ? "Updating…" : proposal ? "Ready to review" : "No change suggested"}
        </span>
      </div>

      <div className="min-h-0 rounded-xl border border-line bg-panel-2 p-3">
        {generating ? (
          <div className="space-y-2" role="status" aria-label="Updating this CV section">
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-11/12" />
            <Skeleton className="h-3.5 w-4/5" />
          </div>
        ) : proposal ? (
          <>
            <p className="line-clamp-6 whitespace-pre-wrap text-sm leading-5 text-fg">{proposal.proposedText}</p>
            {proposal.reason && <p className="mt-2 line-clamp-2 border-t border-line pt-2 text-xs leading-4 text-fg-muted">{proposal.reason}</p>}
          </>
        ) : (
          <p className="text-sm text-fg-muted">
            {hasCompletedReview ? "No change was recommended. The original CV content is unchanged." : "Your proposed update will appear here."}
          </p>
        )}
      </div>

      {generationError && (
        <p className="text-xs text-destructive" role="alert">{generationError}</p>
      )}

      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2">
        <Button type="button" size="sm" variant="outline" disabled={disabled || generating} onClick={() => { onDiscard(); onOpenChange(false); }}>
          Close
        </Button>
        <div className="flex flex-wrap justify-end gap-2">
          {pending && (
            <>
              <Button type="button" size="sm" variant="outline" disabled={disabled || generating} onClick={() => { onReject(pending.id); onOpenChange(false); }}>Reject</Button>
              <Button type="button" size="sm" disabled={disabled || generating} onClick={() => { onAccept(pending.id); onOpenChange(false); }}>Accept and apply</Button>
            </>
          )}
          {rejected && !pending && (
            <Button type="button" size="sm" variant="outline" disabled={disabled || generating} onClick={onRegenerate}>Generate again</Button>
          )}
          {!pending && !rejected && generationError && (
            <Button type="button" size="sm" disabled={disabled || generating} onClick={onRegenerate}>Try again</Button>
          )}
          {!pending && !rejected && hasCompletedReview && !generationError && (
            <Button type="button" size="sm" variant="outline" disabled={disabled || generating} onClick={onRegenerate}>Generate another</Button>
          )}
        </div>
      </div>
    </section>
  );}
