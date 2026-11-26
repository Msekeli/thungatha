import { Dialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JobDetailMeta } from "../shared/job-detail-meta";
import type { JobDiscoveryWorkspaceProps } from "../shared/job-discovery-workspace-types";

type Job = NonNullable<JobDiscoveryWorkspaceProps["selectedDetail"]>;

export function PublicJobDetailHeader({
  job,
  employer,
  initials,
  formatDate,
}: {
  job: Job | null;
  employer: string;
  initials: string;
  formatDate: JobDiscoveryWorkspaceProps["formatDate"];
}) {
  return (
    <header
      className="relative flex shrink-0 items-center gap-3 border-b border-public-modal-border bg-[var(--th-workspace-header)] px-4 py-3 pr-14 text-[var(--th-workspace-header-text)] max-[600px]:flex-wrap max-[600px]:items-start max-[600px]:gap-y-[0.15rem] max-[600px]:pt-4 max-[600px]:pr-[3.75rem] sm:gap-4 sm:px-6 sm:py-4 sm:pr-16 [&_[data-slot=button]]:text-[var(--th-workspace-header-text)] [&_button]:text-[var(--th-workspace-header-text)]"
    >
      {job?.company_logo_url ? (
        <img
          src={job.company_logo_url}
          alt=""
          className="size-11 shrink-0 rounded-xl border border-logo-border bg-white object-contain p-1 sm:size-12"
        />
      ) : (
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-logo-border bg-logo-bg text-xl font-bold text-logo-fg sm:size-12">
          {initials || "?"}
        </span>
      )}
      <div className="min-w-0 flex-1 max-[600px]:pt-0.5">
        <Dialog.Title className="truncate text-title font-bold leading-tight text-[var(--th-workspace-header-text)] sm:text-modal-title">
          {job?.title ?? "Job details"}
        </Dialog.Title>
        <p className="mt-0.5 truncate text-control text-[var(--th-workspace-header-muted)] sm:text-job">
          {employer}
        </p>
      </div>
      {job && (
        <div
          className="ml-auto min-w-0 max-w-[52%] flex-[0_1_auto] pb-0 pr-[3.25rem] max-[600px]:ml-[3.5rem] max-[600px]:max-w-none max-[600px]:flex-[1_0_100%] max-[600px]:pr-0 [&_.th-job-detail-meta]:flex-wrap [&_.th-job-detail-meta]:justify-end max-[600px]:[&_.th-job-detail-meta]:justify-start [&_.th-job-detail-meta-item]:border-[var(--th-public-nav-border)] [&_.th-job-detail-meta-item]:text-[var(--th-workspace-header-muted)] [&_.th-job-detail-meta-item_svg]:text-[var(--th-workspace-header-muted)]"
        >
          <JobDetailMeta
            location={job.location_text}
            postedAt={job.published_at}
            formatDate={formatDate}
          />
        </div>
      )}
      <Dialog.Close
        render={
          <Button
            variant="outline"
            size="icon"
            aria-label="Close job details"
            className="absolute right-3 top-3 size-9 border-public-modal-border bg-public-modal-bg text-fg shadow-sm hover:bg-public-modal-footer focus-visible:outline-accent sm:right-4"
          >
            <X className="size-5" />
          </Button>
        }
      />
    </header>
  );
}
