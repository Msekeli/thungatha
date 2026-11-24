"use client";

import type { CvSuggestion } from "../server/cv-studio-schema";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type Gap = { requirement: string; explanation: string; jobEvidenceRefs: string[] };

export function CvAiSuggestions({
  open, onOpenChange, suggestions, gaps, hasCompletedReview, generating,
  generationError, disabled, onAccept, onReject, onRegenerate, onDiscard,
}: {
  open: boolean; onOpenChange: (open: boolean) => void; suggestions: CvSuggestion[];
  gaps: Gap[]; hasCompletedReview: boolean; generating: boolean; generationError: string | null; disabled: boolean;
  onAccept: (id: string) => void; onReject: (id: string) => void;
  onRegenerate: () => void; onDiscard: () => void;
}) {
  const pending = suggestions.find((item) => item.decision === "pending");
  const rejected = [...suggestions].reverse().find((item) => item.decision === "rejected");
  const accepted = [...suggestions].reverse().find((item) => item.decision === "accepted");
  const proposal = pending ?? rejected;

  if (!open && !generating) return null;

  return (
    <section className="space-y-4 rounded-xl border border-accent/30 bg-panel p-4 sm:p-5" aria-live="polite">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-accent-text">AI-assisted review · 1 of 3</p>
        <h4 className="mt-1 font-semibold">Professional summary</h4>
        <p className="mt-1 text-sm text-fg-muted">Compare the proposal with your current summary. Nothing is applied until you accept it.</p>
      </header>

      {generating ? (
        <div className="space-y-3" aria-label="Generating professional summary">
          <p className="text-sm font-medium">Analysing the job description and confirmed Profile evidence…</p>
          <div className="space-y-2 rounded-lg border border-line p-4">
            <Skeleton className="h-4 w-40" /><Skeleton className="h-3 w-full" /><Skeleton className="h-3 w-full" /><Skeleton className="h-3 w-4/5" />
          </div>
        </div>
      ) : proposal ? (
        <>
          <div className="grid gap-3">
            <section className="space-y-2">
              <h5 className="text-sm font-semibold">Current summary</h5>
              <p className="rounded-lg border border-line bg-panel-2 p-3 text-sm leading-6">{proposal.originalText || "No professional summary currently exists."}</p>
            </section>
            <section className="space-y-2">
              <h5 className="text-sm font-semibold">Proposed summary</h5>
              <p className="rounded-lg border border-accent/40 bg-accent-bg/30 p-3 text-sm leading-6">{proposal.proposedText}</p>
            </section>
            <section className="space-y-1">
              <h5 className="text-sm font-semibold">Why this change was proposed</h5>
              <p className="text-sm leading-6 text-fg-muted">{proposal.reason}</p>
            </section>
            <section className="space-y-2">
              <h5 className="text-sm font-semibold">Supporting evidence</h5>
              {proposal.evidence.map((item) => <div key={item.ref} className="rounded-lg border border-line p-3"><p className="text-xs font-medium text-fg-muted">{item.source === "profile" ? "Confirmed Profile" : "Job description"}</p><p className="mt-1 text-sm leading-6">{item.excerpt}</p></div>)}
            </section>
          </div>
          {rejected && !pending && <p className="rounded-lg bg-panel-2 p-3 text-sm text-fg-muted">You rejected this proposal. Generate another version or discard it.</p>}
        </>
      ) : accepted ? (
        <p className="rounded-lg border border-line bg-panel-2 p-4 text-sm">The proposed summary has been accepted and applied to the CV draft.</p>
      ) : hasCompletedReview ? (
        <p className="rounded-lg border border-line bg-panel-2 p-4 text-sm text-fg-muted">No summary change was recommended. Your current summary remains unchanged.</p>
      ) : (
        <p className="text-sm text-fg-muted">Ready to generate a job-specific professional summary.</p>
      )}

      {generationError && <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive" role="alert">{generationError}</p>}
      {!generating && gaps.length > 0 && <section className="space-y-2 border-t border-line pt-3"><h5 className="text-sm font-semibold">Requirements not demonstrated</h5>{gaps.map((gap,index)=><div key={index} className="rounded-lg bg-panel-2 p-3"><p className="text-sm font-medium">{gap.requirement}</p><p className="mt-1 text-sm text-fg-muted">{gap.explanation}</p></div>)}</section>}

      <footer className="flex flex-wrap justify-end gap-2 border-t border-line pt-3">
        {generating ? <Button type="button" variant="outline" disabled>Generating…</Button> : pending ? <><Button type="button" variant="outline" disabled={disabled} onClick={() => { onReject(pending.id); onOpenChange(false); }}>Reject proposal</Button><Button type="button" disabled={disabled} onClick={() => { onAccept(pending.id); onOpenChange(false); }}>Accept and apply</Button></> : rejected ? <><Button type="button" variant="outline" onClick={() => { onDiscard(); onOpenChange(false); }}>Discard proposal</Button><Button type="button" disabled={disabled} onClick={onRegenerate}>Generate again</Button></> : <><Button type="button" variant="outline" onClick={() => { onDiscard(); onOpenChange(false); }}>Close review</Button><Button type="button" disabled={disabled} onClick={onRegenerate}>{generationError ? "Try again" : "Generate summary"}</Button></>}
      </footer>
    </section>
  );
}
