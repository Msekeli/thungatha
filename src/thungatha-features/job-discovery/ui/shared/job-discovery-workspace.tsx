"use client";

import { AuthenticatedJobResultsPanel } from "../authenticated/job-results-panel";
import { AuthenticatedJobDetailPanel } from "../authenticated/job-detail-panel";
import type { JobDiscoveryWorkspaceProps } from "./job-discovery-workspace-types";

export function JobDiscoveryWorkspace(props: JobDiscoveryWorkspaceProps) {
  const hasLeadingColumn = Boolean(props.leadingColumn);
  return (
    <div
      className={[
        "th-jobs-workspace th-jobs-redesign-workspace grid h-[min(72dvh,900px)] max-h-[calc(100dvh-12rem)] min-h-0 w-full gap-4 max-[900px]:h-[calc(100dvh-11rem)] max-[900px]:max-h-none max-[900px]:gap-2 max-[900px]:flex max-[900px]:flex-col max-[900px]:overflow-visible max-[700px]:h-full max-[700px]:flex-1 max-[700px]:gap-0",
        hasLeadingColumn
          ? "grid-cols-[minmax(0,15%)_minmax(0,1fr)_minmax(0,1fr)] overflow-hidden max-[1199px]:h-[min(56dvh,700px)] max-[1199px]:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] max-[1199px]:overflow-hidden max-[700px]:h-full"
          : "grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]",
      ].join(" ")}
    >
      {props.leadingColumn}
      <AuthenticatedJobResultsPanel
        jobs={props.jobs}
        feed={props.feed}
        loading={props.loading}
        error={props.error}
        hasFilters={props.hasFilters}
        mobileDetail={props.mobileDetail}
        selectedId={props.selectedId}
        loadMoreRef={props.loadMoreRef}
        sourceFor={props.sourceFor}
        formatDate={props.formatDate}
        onRetry={props.onRetryFeed}
        onSelect={props.onSelect}
        onSave={props.onSaveJob}
        onDismiss={props.onDismissJob}
        configured={props.configured}
      />
      <AuthenticatedJobDetailPanel
        configured={props.configured}
        job={props.selectedDetail}
        source={props.selectedSource}
        applicationDestination={props.applicationDestination}
        applicationUrl={props.applicationUrl}
        jobSourceUrl={props.jobSourceUrl}
        busy={props.busy}
        detailLoading={props.detailLoading}
        mobileDetail={props.mobileDetail}
        activityError={props.activityError}
        detailError={props.detailError}
        formatDate={props.formatDate}
        onBack={props.onBack}
        onViewMatch={props.onViewMatch}
        onApply={props.onApply}
        onSave={props.onSave}
        onDismiss={props.onDismiss}
        onRetry={props.onRetryDetail}
      />
    </div>
  );
}
