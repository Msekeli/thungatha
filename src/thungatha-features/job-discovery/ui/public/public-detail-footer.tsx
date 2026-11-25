import type { JobDiscoveryWorkspaceProps } from "../shared/job-discovery-workspace-types";
import { JobDetailActions } from "../authenticated/job-detail-actions";
import { JobDetailStatus } from "../authenticated/job-detail-status";

type Job = NonNullable<JobDiscoveryWorkspaceProps["selectedDetail"]>;

export function PublicJobDetailFooter({
  data,
  job,
}: {
  data: JobDiscoveryWorkspaceProps;
  job: Job;
}) {
  return (
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
  );
}
