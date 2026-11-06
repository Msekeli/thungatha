"use client";

import { Dialog } from "@base-ui/react/dialog";
import { LoaderCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JobDetailPresentation } from "../shared/job-detail-presentation";
import { JobDetailActions } from "../authenticated/job-detail-actions";
import { JobDetailStatus } from "../authenticated/job-detail-status";
import { JobDetailMatchSummary } from "../authenticated/job-detail-match-summary";
import type { JobDiscoveryWorkspaceProps } from "../shared/job-discovery-workspace-types";

export function PublicJobDetailDialog({
  data,
  open,
  onClose,
}: {
  data: JobDiscoveryWorkspaceProps;
  open: boolean;
  onClose: () => void;
}) {
  const job = data.selectedDetail;
  return (
    <Dialog.Root open={open} onOpenChange={(next) => !next && onClose()}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-[1500] bg-overlay backdrop-blur-sm" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 z-[1501] flex max-h-[calc(100dvh-1.5rem)] w-[min(780px,calc(100vw-1.5rem))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-modal border border-modal-border bg-modal text-fg shadow-modal outline-none sm:max-h-[calc(100dvh-3rem)]">
          <header className="flex shrink-0 items-center justify-between gap-4 border-b border-modal-border bg-gradient-to-b from-accent-bg to-transparent px-4 py-4 sm:px-7">
            <div className="min-w-0">
              <Dialog.Title className="text-lg font-semibold text-fg sm:text-modal-title">
                Job details
              </Dialog.Title>
              <p className="mt-1 text-sm text-fg-muted">Review the opportunity before applying.</p>
            </div>
            <Dialog.Close render={<Button variant="ghost" size="icon" aria-label="Close job details"><X /></Button>} />
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-7 sm:py-6">
            {data.detailLoading && !job ? (
              <div role="status" className="flex items-center gap-3 py-8 text-sm text-fg-muted">
                <LoaderCircle className="animate-spin" aria-hidden="true" /> Loading job details…
              </div>
            ) : job ? (
              <JobDetailPresentation
                job={job}
                postedAt={data.selectedSource?.published_at ?? null}
                formatDate={data.formatDate}
                descriptionIsPreview={data.selectedSource?.provider_key === "adzuna" || data.selectedSource?.provider_key === "jooble"}
                headingAction={<JobDetailMatchSummary onViewMatch={data.onViewMatch} />}
              />
            ) : (
              <p className="py-8 text-sm text-fg-muted">Select an opportunity to view its details.</p>
            )}
          </div>
          {job && (
            <footer className="flex shrink-0 flex-col gap-3 border-t border-modal-border bg-modal-footer px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
              <JobDetailStatus activityError={data.activityError} detailError={data.detailError} applicationUrl={data.applicationUrl} onRetry={data.onRetryDetail} />
              <JobDetailActions configured={data.configured} job={job} applicationDestination={data.applicationDestination} applicationUrl={data.applicationUrl} jobSourceUrl={data.jobSourceUrl} busy={data.busy} detailLoading={data.detailLoading} onApply={data.onApply} onSave={data.onSave} onDismiss={data.onDismiss} />
            </footer>
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
