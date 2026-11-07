"use client";

import "./public-job-detail-dialog.css";

import { Dialog } from "@base-ui/react/dialog";
import { LoaderCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JobDetailMeta } from "../shared/job-detail-meta";
import { JobDetailDescription } from "../shared/job-detail-description";
import { JobDetailActions } from "../authenticated/job-detail-actions";
import { JobDetailStatus } from "../authenticated/job-detail-status";
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
  const employer = job?.employer_name || "Employer not listed";
  const initials = employer
    .split(/\\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <Dialog.Root open={open} onOpenChange={(next) => !next && onClose()}>
      <Dialog.Portal>
        <Dialog.Backdrop className="th-public-job-detail-dialog__backdrop fixed inset-0 bg-overlay backdrop-blur-sm" onClick={onClose} />
        <Dialog.Popup className="th-public-job-detail-dialog fixed left-1/2 top-1/2 flex h-public-modal max-h-[calc(100dvh-1rem)] w-[min(780px,calc(100vw-1rem))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-modal border border-public-modal-border text-[var(--th-fg)] shadow-public-modal outline-none sm:max-h-[calc(100dvh-3rem)] sm:w-[min(780px,calc(100vw-3rem))]">
          <header className="th-public-job-detail-dialog__header relative flex shrink-0 items-center gap-3 border-b border-public-modal-border px-4 py-3 pr-14 sm:gap-4 sm:px-6 sm:py-4 sm:pr-16">
            {job?.company_logo_url ? (
              <img src={job.company_logo_url} alt="" className="size-11 shrink-0 rounded-xl border border-logo-border bg-white object-contain p-1 sm:size-12" />
            ) : (
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-logo-border bg-logo-bg text-xl font-bold text-logo-fg sm:size-12">
                {initials || "?"}
              </span>
            )}
            <div className="th-public-job-detail-dialog__identity min-w-0 flex-1">
              <Dialog.Title className="truncate text-title font-bold leading-tight text-[var(--th-workspace-header-text)] sm:text-modal-title">
                {job?.title ?? "Job details"}
              </Dialog.Title>
              <p className="mt-0.5 truncate text-control text-[var(--th-workspace-header-muted)] sm:text-job">{employer}</p>
            </div>
            {job && (
              <div className="th-public-job-detail-dialog__meta min-w-0 shrink-0">
                <JobDetailMeta
                  location={job.location_text}
                  postedAt={job.published_at}
                  formatDate={data.formatDate}
                />
              </div>
            )}
            <Dialog.Close
              render={
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Close job details"
                  className="th-public-job-detail-dialog__close absolute right-3 top-3 size-9 border-public-modal-border bg-public-modal-bg text-fg shadow-sm hover:bg-public-modal-footer focus-visible:outline-accent sm:right-4 sm:top-3"
                >
                  <X className="size-5" />
                </Button>
              }
            />
          </header>

          <div className="th-public-job-detail-dialog__content min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 py-4 sm:px-6 sm:py-5">
            {data.detailLoading && !job ? (
              <div role="status" className="flex items-center gap-3 py-8 text-sm text-fg-muted">
                <LoaderCircle className="animate-spin" aria-hidden="true" />
                Loading job details…
              </div>
            ) : job ? (
              <JobDetailDescription description={job.description} largeText />
            ) : (
              <p className="py-8 text-sm text-fg-muted">Select an opportunity to view its details.</p>
            )}
          </div>

          {job && (
            <footer className="th-public-job-detail-dialog__footer flex shrink-0 flex-col gap-2 border-t border-public-modal-border px-4 py-3 sm:px-6 sm:py-3">
              <JobDetailStatus
                activityError={data.activityError}
                detailError={data.detailError}
                applicationUrl={data.applicationUrl}
                onRetry={data.onRetryDetail}
              />
              <JobDetailActions
                configured={data.configured}
                job={job}
                applicationDestination={data.applicationDestination}
                applicationUrl={data.applicationUrl}
                busy={data.busy}
                detailLoading={data.detailLoading}
                onApply={data.onApply}
                onSave={data.onSave}
                onDismiss={data.onDismiss}
              />
            </footer>
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
