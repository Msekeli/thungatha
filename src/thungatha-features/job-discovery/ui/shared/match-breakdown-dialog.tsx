"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnchoredPopover } from "@/components/ui/anchored-popover";
import { MatchAssessmentOverview } from "./match-assessment-overview";
import { MatchAssessmentRequirements } from "./match-assessment-requirements";
import { MatchAssessmentStatus } from "./match-assessment-status";
import { useMatchAssessment } from "./use-match-assessment";

type Props = {
  open: boolean;
  anchorEl: HTMLElement | null;
  jobId: string | null;
  onClose: () => void;
};

export function MatchBreakdownDialog({ open, anchorEl, jobId, onClose }: Props) {
  const { status, assessment, isRetrying, retryError, retryAssessment } =
    useMatchAssessment(open, jobId);

  return (
    <AnchoredPopover
      open={open}
      anchor={anchorEl}
      onClose={onClose}
      label="Profile match breakdown"
      className="max-h-[min(72dvh,520px)] w-[min(380px,calc(100vw-24px))] overflow-y-auto rounded-xl border border-line bg-panel text-fg shadow-xl"
    >
      <header className="flex items-center justify-between gap-4 border-b border-line px-4 py-3">
        <strong>AI job assessment</strong>
        <Button variant="ghost" size="sm" aria-label="Close match breakdown" onClick={onClose}>
          <X size={16} />
        </Button>
      </header>
      <div className="space-y-4 p-4 text-sm">
        <MatchAssessmentStatus
          status={status}
          isRetrying={isRetrying}
          retryError={retryError}
          onRetry={retryAssessment}
        />
        {status === "ready" && assessment && (
          <>
            <MatchAssessmentOverview assessment={assessment} />
            <MatchAssessmentRequirements assessment={assessment} />
          </>
        )}
      </div>
    </AnchoredPopover>
  );
}
