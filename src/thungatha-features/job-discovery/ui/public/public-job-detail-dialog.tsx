"use client";

import { Dialog } from "@base-ui/react/dialog";
import { LoaderCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JobDetailMeta } from "../shared/job-detail-meta";
import { JobDetailDescription } from "../shared/job-detail-description";
import { JobSalary } from "../shared/job-salary";
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
  const employer = job?.employer_name?.trim() || "Employer not listed";
  const initials = (job?.employer_name?.trim() || job?.title || "T").slice(0, 1).toUpperCase();
  return (
    <Dialog.Root open={open} onOpenChange={(next) => !next && onClose()}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-[1500] bg-overlay backdrop-blur-sm" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 z-[1501] flex max-h-[calc(100dvh-1.5rem)] w-[min(780px,calc(100vw-1.5rem))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-modal border border-public-modal-border bg-modal text-fg shadow-modal outline-none sm:max-h-[calc(100dvh-3rem)]">
          <header className="flex shrink-0 items-start gap-3 border-b border-public-modal-border bg-gradient-to-b from-public-modal-header to-transparent px-4 py-4 sm:gap-5 sm:px-7 sm:py-6">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-logo-border bg-logo-bg text-xl font-bold text-logo-fg">{initials}</span>
            <div className="min-w-0 flex-1">
              <Dialog.Title className="text-title font-bold leading-tight text-fg sm:text-modal-title">
                {job?.title ?? "Job details"}
              </Dialog.Title>
              <p className="mt-1 text-control text-fg-muted sm:text-job">{employer}</p>
              {job && <JobDetailMeta location={job.location_text} employmentType={job.employment_type} workMode={job.work_mode} postedAt={data.selectedSource?.published_at || job.updated_at} formatDate={data.formatDate} />}
            </div>
            <Dialog.Close render={<Button variant="ghost" size="icon" aria-label="Close job details"><X /></Button>} />
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-7 sm:py-6">
            {data.detailLoading && !job ? (
              <div role="status" className="flex items-center gap-3 py-8 text-sm text-fg-muted">
                <LoaderCircle className="animate-spin" aria-hidden="true" /> Loading job details…
              </div>
            ) : job ? (
              <div className="flex flex-col gap-4">
                <JobSalary minimum={job.salary_min} maximum={job.salary_max} currency={job.salary_currency} hideWhenEmpty prefix="Salary: " locale="en-ZA" />
                <JobDetailDescription description={job.description} descriptionIsPreview={data.selectedSource?.provider_key === "adzuna" || data.selectedSource?.provider_key === "jooble"} />
              </div>
            ) : (
              <p className="py-8 text-sm text-fg-muted">Select an opportunity to view its details.</p>
            )}
          </div>
          {job && (
            <footer className="flex shrink-0 flex-col gap-3 border-t border-public-modal-border bg-public-modal-footer px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
              <JobDetailStatus activityError={data.activityError} detailError={data.detailError} applicationUrl={data.applicationUrl} onRetry={data.onRetryDetail} />
              <JobDetailActions configured={data.configured} job={job} applicationDestination={data.applicationDestination} applicationUrl={data.applicationUrl} jobSourceUrl={data.jobSourceUrl} busy={data.busy} detailLoading={data.detailLoading} onApply={data.onApply} onSave={data.onSave} onDismiss={data.onDismiss} />
            </footer>
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
