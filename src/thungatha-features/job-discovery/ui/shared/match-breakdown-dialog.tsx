"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnchoredPopover } from "@/components/ui/anchored-popover";

type EvidenceItem = { id: string; sourcePath: string; content: string };
type RequirementAssessment = {
  requirement: string;
  importance: "mandatory" | "preferred" | "uncertain";
  assessment: "supported" | "not_demonstrated" | "contradictory" | "uncertain";
  explanation: string;
  jobEvidenceRefs: string[];
  profileEvidenceRefs: string[];
  jobEvidence?: EvidenceItem[];
  profileEvidence?: EvidenceItem[];
};
type MatchAssessment = {
  classification: "match" | "relevant";
  summary: string;
  alignmentExplanation: string;
  requirements: RequirementAssessment[];
  semanticAlignment?: { jobEvidence?: EvidenceItem[]; profileEvidence?: EvidenceItem[] };
  understandingCoverage?: "complete" | "partial" | "unavailable";
  gaps: Array<{ description: string; jobEvidenceRefs: string[]; profileEvidenceRefs: string[]; jobEvidence?: EvidenceItem[]; profileEvidence?: EvidenceItem[] }>;
};
type AssessmentStatus = "idle" | "loading" | "pending" | "failed" | "unavailable" | "profile_unconfirmed" | "ready" | "error";
type Props = { open: boolean; anchorEl: HTMLElement | null; jobId: string | null; onClose: () => void };

export function MatchBreakdownDialog({ open, anchorEl, jobId, onClose }: Props) {
  const [status, setStatus] = useState<AssessmentStatus>("idle");
  const [assessment, setAssessment] = useState<MatchAssessment | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryError, setRetryError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !jobId) return;
    const controller = new AbortController();
    setStatus("loading");
    setAssessment(null);

    fetch(`/api/jobs/${jobId}/match-assessment`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Assessment could not be loaded.");
        return response.json() as Promise<{ status: AssessmentStatus; assessment?: MatchAssessment | null }>;
      })
      .then((result) => {
        setStatus(result.status);
        setAssessment(result.assessment ?? null);
      })
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === "AbortError") return;
        setStatus("error");
      });
    return () => controller.abort();
  }, [open, jobId]);

  useEffect(() => {
    if (!open || !jobId || status !== "pending") return;
    const interval = window.setInterval(async () => {
      try {
        const response = await fetch(`/api/jobs/${jobId}/match-assessment`);
        if (!response.ok) return;
        const result = await response.json() as { status: AssessmentStatus; assessment?: MatchAssessment | null };
        if (result.status !== "pending") {
          setStatus(result.status);
          setAssessment(result.assessment ?? null);
        }
      } catch {
        // Keep the pending state; the next poll can recover from transient failures.
      }
    }, 5000);
    return () => window.clearInterval(interval);
  }, [open, jobId, status]);

  async function retryAssessment() {
    if (!jobId || isRetrying) return;
    setIsRetrying(true);
    setRetryError(null);
    try {
      const response = await fetch(`/api/jobs/${jobId}/match-assessment`, { method: "POST" });
      if (!response.ok) {
        const result = await response.json().catch(() => null) as { error?: string } | null;
        throw new Error(result?.error ?? "The assessment could not be retried.");
      }
      setAssessment(null);
      setStatus("pending");
    } catch (error) {
      setRetryError(error instanceof Error ? error.message : "The assessment could not be retried.");
    } finally {
      setIsRetrying(false);
    }
  }

  return (
    <AnchoredPopover open={open} anchor={anchorEl} onClose={onClose} label="Profile match breakdown"
      className="max-h-[min(72dvh,520px)] w-[min(380px,calc(100vw-24px))] overflow-y-auto rounded-xl border border-line bg-panel text-fg shadow-xl">
      <header className="flex items-center justify-between gap-4 border-b border-line px-4 py-3">
        <strong>AI job assessment</strong>
        <Button variant="ghost" size="sm" aria-label="Close match breakdown" onClick={onClose}><X size={16} /></Button>
      </header>
      <div className="space-y-4 p-4 text-sm">
        {status === "loading" && <p className="text-fg-muted">Loading assessment…</p>}
        {status === "pending" && <div><h3 className="mb-1 font-semibold">Assessment pending</h3><p className="text-fg-muted">This job is awaiting AI assessment. The result will appear here when processing completes.</p></div>}
        {status === "unavailable" && <div><h3 className="mb-1 font-semibold">Assessment unavailable</h3><p className="text-fg-muted">There is not enough reliable evidence to classify this job. This does not mean you are unsuitable; it means the available information does not support a dependable assessment.</p></div>}
        {status === "failed" && <div>
          <h3 className="mb-1 font-semibold">Assessment could not be completed</h3>
          <p className="text-fg-muted">The assessment could not be completed. Your Profile and this job remain available; no classification has been assigned.</p>
          <Button className="mt-3" size="sm" onClick={retryAssessment} disabled={isRetrying}>{isRetrying ? "Retrying…" : "Retry assessment"}</Button>
          {retryError && <p role="alert" className="mt-2 text-fg-muted">{retryError}</p>}
        </div>}
        {status === "profile_unconfirmed" && <p className="text-fg-muted">Confirm your Profile before Thungatha can assess how your experience aligns with this role.</p>}
        {status === "error" && <p className="text-fg-muted">The assessment could not be loaded. Close this panel and try again.</p>}
        {status === "ready" && assessment && <>
          <div><span className="text-xs text-fg-muted">Classification</span><h3 className="mt-1 font-semibold">{assessment.classification === "match" ? "Match" : "Relevant"}</h3><p className="mt-1 text-fg-muted">{assessment.summary}</p></div>
          <p className="text-fg-muted">{assessment.alignmentExplanation}</p>
          {assessment.understandingCoverage !== "complete" && <p className="rounded-md border border-line p-2 text-xs text-fg-muted">
            {assessment.understandingCoverage === "partial" ? "The job advert could only be partially analysed. Some requirements may not be represented below." : "The job advert could not be fully analysed. Treat this assessment as incomplete."}
          </p>}
          {assessment.semanticAlignment && <section className="space-y-2">
            <h4 className="font-semibold">Overall supporting evidence</h4>
            {assessment.semanticAlignment.jobEvidence?.map((evidence) => <p key={evidence.id} className="rounded-md bg-panel p-2 text-fg-muted">{evidence.content}</p>)}
            {assessment.semanticAlignment.profileEvidence?.map((evidence) => <p key={evidence.id} className="rounded-md bg-panel p-2 text-fg-muted"><span className="font-semibold">Your Profile · {evidence.sourcePath}: </span>{evidence.content}</p>)}
          </section>}
          {assessment.requirements.length > 0 && <section>
            <h4 className="mb-2 font-semibold">Requirement evidence</h4>
            <ul className="space-y-3">{assessment.requirements.map((item, index) => <li key={item.requirement + index} className="border-t border-line pt-2">
              <p className="font-medium">{item.requirement}</p>
              <p className="mt-1 text-xs text-fg-muted">{item.importance} requirement · {item.assessment.replaceAll("_", " ")}</p>
              <p className="mt-1 text-fg-muted">{item.explanation}</p>
              {((item.jobEvidence?.length ?? 0) > 0 || (item.profileEvidence?.length ?? 0) > 0) && <div className="mt-2 space-y-2">
                {item.jobEvidence?.map((evidence) => <div key={evidence.id} className="rounded-md bg-panel p-2"><span className="text-xs font-semibold text-fg-muted">Job description</span><p className="mt-1 text-fg-muted">{evidence.content}</p></div>)}
                {item.profileEvidence?.map((evidence) => <div key={evidence.id} className="rounded-md bg-panel p-2"><span className="text-xs font-semibold text-fg-muted">Your Profile · {evidence.sourcePath}</span><p className="mt-1 text-fg-muted">{evidence.content}</p></div>)}
              </div>}
            </li>)}</ul>
          </section>}
          {assessment.gaps.length > 0 && <section>
            <h4 className="mb-2 font-semibold">Gaps and unknowns</h4>
            <ul className="list-disc space-y-1 pl-5 text-fg-muted">{assessment.gaps.map((gap, index) => <li key={gap.description + index} className="space-y-1">
              <p>{gap.description}</p>{gap.jobEvidence?.map((evidence) => <p key={evidence.id} className="text-xs">Job: {evidence.content}</p>)}{gap.profileEvidence?.map((evidence) => <p key={evidence.id} className="text-xs">Profile: {evidence.content}</p>)}
            </li>)}</ul>
          </section>}
          <p className="border-t border-line pt-3 text-xs text-fg-muted">This is an evidence-based guidance tool, not a hiring prediction or guarantee.</p>
        </>}
      </div>
    </AnchoredPopover>
  );
}
