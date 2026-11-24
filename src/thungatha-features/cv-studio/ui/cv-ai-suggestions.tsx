"use client";

import { Dialog } from "@base-ui/react/dialog";
import type { CvSuggestion } from "../server/cv-studio-schema";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type Gap = { requirement: string; explanation: string; jobEvidenceRefs: string[] };

export function CvAiSuggestions({
  open, onOpenChange, suggestions, gaps, hasCompletedReview, generating,
  disabled, onAccept, onReject, onRegenerate, onDiscard,
}: {
  open: boolean; onOpenChange: (open: boolean) => void; suggestions: CvSuggestion[];
  gaps: Gap[]; hasCompletedReview: boolean; generating: boolean; disabled: boolean;
  onAccept: (id: string) => void; onReject: (id: string) => void;
  onRegenerate: () => void; onDiscard: () => void;
}) {
  const pending = suggestions.find((item) => item.decision === "pending");
  const rejected = [...suggestions].reverse().find((item) => item.decision === "rejected");
  const accepted = [...suggestions].reverse().find((item) => item.decision === "accepted");
  const proposal = pending ?? rejected;
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-[1800] bg-black/60 backdrop-blur-sm" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 z-[1801] flex max-h-[min(88dvh,760px)] w-[min(92vw,720px)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-line bg-panel text-fg shadow-xl outline-none">
          <header className="flex shrink-0 items-start justify-between gap-4 border-b border-line p-5">
            <div>
              <Dialog.Title className="text-lg font-semibold">Tailor professional summary</Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-fg-muted">Review one proposed paragraph. It only updates this CV draft after you accept it.</Dialog.Description>
            </div>
            <Dialog.Close render={<Button type="button" variant="outline" size="sm">Close</Button>} />
          </header>
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
            {generating ? (
              <section className="space-y-3" aria-live="polite" aria-label="Generating professional summary">
                <p className="text-sm font-semibold">Generating your tailored paragraph</p>
                <p className="text-sm text-fg-muted">Comparing job requirements with confirmed Profile evidence.</p>
                <div className="space-y-2 rounded-lg border border-line p-4">
                  <Skeleton className="h-4 w-40" /><Skeleton className="h-3 w-full" /><Skeleton className="h-3 w-full" /><Skeleton className="h-3 w-4/5" />
                </div>
              </section>
            ) : proposal ? (
              <>
                <section className="space-y-2"><h3 className="text-sm font-semibold">Current professional summary</h3><p className="rounded-lg border border-line bg-panel-2 p-4 text-sm leading-6">{proposal.originalText || "No professional summary currently exists."}</p></section>
                <section className="space-y-2"><h3 className="text-sm font-semibold">AI-proposed summary</h3><p className="rounded-lg border border-accent/40 bg-accent-bg/30 p-4 text-sm leading-6">{proposal.proposedText}</p></section>
                <section className="space-y-2"><h3 className="text-sm font-semibold">Why this change was proposed</h3><p className="text-sm leading-6 text-fg-muted">{proposal.reason}</p></section>
                <section className="space-y-2"><h3 className="text-sm font-semibold">Supporting evidence</h3>
                  {proposal.evidence.map((item) => <div key={item.ref} className="rounded-lg border border-line p-3"><p className="text-xs font-medium text-fg-muted">{item.source === "profile" ? "Confirmed Profile" : "Job description"}</p><p className="mt-1 text-sm leading-6">{item.excerpt}</p></div>)}
                </section>
                {rejected && !pending && <p className="rounded-lg border border-line bg-panel-2 p-3 text-sm text-fg-muted">You rejected this proposal. Generate another version or discard it and keep your current summary.</p>}
              </>
            ) : accepted ? <p className="rounded-lg border border-line bg-panel-2 p-4 text-sm">The proposed summary has been accepted and applied to the CV draft.</p>
              : hasCompletedReview ? <p className="rounded-lg border border-line bg-panel-2 p-4 text-sm text-fg-muted">No summary change was recommended. Your current paragraph remains unchanged.</p>
              : <p className="text-sm text-fg-muted">Ready to generate a job-specific professional summary.</p>}
            {!generating && gaps.length > 0 && <section className="space-y-2 border-t border-line pt-4"><h3 className="text-sm font-semibold">Requirements not demonstrated</h3>{gaps.map((gap,index)=><div key={index} className="rounded-lg bg-panel-2 p-3"><p className="text-sm font-medium">{gap.requirement}</p><p className="mt-1 text-sm text-fg-muted">{gap.explanation}</p></div>)}</section>}
          </div>
          <footer className="flex shrink-0 flex-wrap justify-end gap-2 border-t border-line p-5">
            {generating ? <Button type="button" variant="outline" disabled>Generating…</Button> : pending ? <><Button type="button" variant="outline" disabled={disabled} onClick={()=>onReject(pending.id)}>Reject proposal</Button><Button type="button" disabled={disabled} onClick={()=>onAccept(pending.id)}>Accept and apply to CV</Button></> : rejected ? <><Button type="button" variant="outline" onClick={onDiscard}>Discard proposal</Button><Button type="button" disabled={disabled} onClick={onRegenerate}>Generate again</Button></> : <><Button type="button" variant="outline" onClick={onDiscard}>Close</Button><Button type="button" disabled={disabled} onClick={onRegenerate}>Generate summary</Button></>}
          </footer>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
