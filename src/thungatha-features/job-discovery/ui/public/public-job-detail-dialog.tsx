"use client";

import { Dialog } from "@base-ui/react/dialog";
import { LoaderCircle } from "lucide-react";
import { JobDetailDescription } from "../shared/job-detail-description";
import type { JobDiscoveryWorkspaceProps } from "../shared/job-discovery-workspace-types";
import { PublicJobDetailFooter } from "./public-detail-footer";
import { PublicJobDetailHeader } from "./public-detail-header";

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
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => !next && onClose()}
    >
      <Dialog.Portal>
        <Dialog.Backdrop
          className="fixed inset-0 z-[1600] bg-overlay backdrop-blur-sm"
          onClick={onClose}
        />
        <Dialog.Popup
          className="fixed left-1/2 top-1/2 z-[1601] isolate flex h-public-modal max-h-[calc(100dvh-1rem)] w-[min(780px,calc(100vw-1rem))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-modal border border-public-modal-border bg-[var(--th-public-modal-bg,var(--th-modal))] text-fg shadow-public-modal outline-none sm:max-h-[calc(100dvh-3rem)] sm:w-[min(780px,calc(100vw-3rem))]"
        >
          <PublicJobDetailHeader
            job={job}
            employer={employer}
            initials={initials}
            formatDate={data.formatDate}
          />
          <div
            className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain bg-[var(--th-public-modal-bg,var(--th-modal))] px-4 py-4 [-webkit-overflow-scrolling:touch] [scrollbar-gutter:stable] sm:px-6 sm:py-5"
          >
            {data.detailLoading && !job ? (
              <div
                role="status"
                className="flex items-center gap-3 py-8 text-sm text-fg-muted"
              >
                <LoaderCircle className="animate-spin" aria-hidden="true" />
                Loading job details…
              </div>
            ) : job ? (
              <JobDetailDescription
                description={job.description}
                largeText
              />
            ) : (
              <p className="py-8 text-sm text-fg-muted">
                Select an opportunity to view its details.
              </p>
            )}
          </div>
          {job && <PublicJobDetailFooter data={data} job={job} />}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
