"use client";

import { AuthenticatedJobDetailContent } from "./job-detail-content";
import type { JobDetailContentProps } from "./job-detail-types";
import { JobOpportunityDetailPanel } from "../shared/job-opportunity-detail-panel";
type Props = JobDetailContentProps & {
  mobileDetail: boolean;
};

export function AuthenticatedJobDetailPanel({
  configured,
  job,
  source,
  applicationDestination,
  applicationUrl,
  jobSourceUrl,
  busy,
  detailLoading,
  mobileDetail,
  activityError,
  detailError,
  formatDate,
  onBack,
  onViewMatch,
  onApply,
  onSave,
  onDismiss,
  onRetry,
}: Props) {
  return (
    <JobOpportunityDetailPanel
      mobileDetail={mobileDetail}
      onBack={onBack}
      loading={detailLoading}
    >
      <AuthenticatedJobDetailContent
        configured={configured}
        job={job}
        source={source}
        applicationDestination={applicationDestination}
        applicationUrl={applicationUrl}
        jobSourceUrl={jobSourceUrl}
        busy={busy}
        detailLoading={detailLoading}
        activityError={activityError}
        detailError={detailError}
        formatDate={formatDate}
        onBack={onBack}
        onViewMatch={onViewMatch}
        onApply={onApply}
        onSave={onSave}
        onDismiss={onDismiss}
        onRetry={onRetry}
      />
    </JobOpportunityDetailPanel>
  );
}
