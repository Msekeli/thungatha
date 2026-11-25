"use client";

import { Button } from "@/components/ui/button";
import type { AssessmentStatus } from "./match-assessment-types";

type Props = {
  status: AssessmentStatus;
  isRetrying: boolean;
  retryError: string | null;
  onRetry: () => void;
};

export function MatchAssessmentStatus({ status, isRetrying, retryError, onRetry }: Props) {
  if (status === "loading") return <p className="text-fg-muted">Loading assessment…</p>;
  if (status === "pending") {
    return (
      <div>
        <h3 className="mb-1 font-semibold">Assessment pending</h3>
        <p className="text-fg-muted">
          This job is awaiting AI assessment. The result will appear here when processing completes.
        </p>
      </div>
    );
  }
  if (status === "unavailable") {
    return (
      <div>
        <h3 className="mb-1 font-semibold">Assessment unavailable</h3>
        <p className="text-fg-muted">
          There is not enough reliable evidence to classify this job. This does not mean you are unsuitable; the available information does not support a dependable assessment.
        </p>
      </div>
    );
  }
  if (status === "failed") {
    return (
      <div>
        <h3 className="mb-1 font-semibold">Assessment could not be completed</h3>
        <p className="text-fg-muted">
          Your Profile and this job remain available; no classification has been assigned.
        </p>
        <Button className="mt-3" size="sm" onClick={onRetry} disabled={isRetrying}>
          {isRetrying ? "Retrying…" : "Retry assessment"}
        </Button>
        {retryError && <p role="alert" className="mt-2 text-fg-muted">{retryError}</p>}
      </div>
    );
  }
  if (status === "profile_unconfirmed") {
    return (
      <p className="text-fg-muted">
        Confirm your Profile before Thungatha can assess how your experience aligns with this role.
      </p>
    );
  }
  if (status === "unusable_description") {
    return (
      <p className="text-fg-muted">
        This advert does not contain enough readable job information for a reliable assessment.
      </p>
    );
  }
  if (status === "error") {
    return (
      <p className="text-fg-muted">
        The assessment could not be loaded. Close this panel and try again.
      </p>
    );
  }
  return null;
}
