"use client";

import { useState } from "react";
import type { Job } from "../job-discovery-utils";
import type { JobDiscoveryWorkspaceProps } from "../shared/job-discovery-workspace-types";
import { PublicJobResultsPanel } from "./public-job-results-panel";
import { AuthenticatedJobResultsPanel } from "../authenticated/job-results-panel";
import { PublicJobDetailDialog } from "./public-job-detail-dialog";

export function PublicJobDiscoveryWorkspace({
  data,
}: {
  data: JobDiscoveryWorkspaceProps;
}) {
  const [detailOpen, setDetailOpen] = useState(false);
  function selectJob(job: Job) {
    data.onSelect(job);
    setDetailOpen(true);
  }
  function closeDetails() {
    setDetailOpen(false);
    data.onBack();
  }
  return (
    <>
      <div className={data.leadingColumn
        ? "grid h-full min-h-0 min-w-0 grid-cols-1 gap-5 min-[1200px]:grid-cols-[261px_minmax(0,1fr)]"
        : "grid h-full min-h-0 min-w-0 grid-cols-1"}>
        {data.leadingColumn}
        <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden">
          {data.isAuthenticated ? (
            <AuthenticatedJobResultsPanel
              jobs={data.jobs}
              feed={data.feed}
              loading={data.loading}
              error={data.error}
              hasFilters={data.hasFilters}
              mobileDetail={data.mobileDetail}
              selectedId={data.selectedId}
              loadMoreRef={data.loadMoreRef}
              sourceFor={data.sourceFor}
              formatDate={data.formatDate}
              onRetry={data.onRetryFeed}
              onSelect={selectJob}
              onSave={data.onSaveJob}
              onDismiss={data.onDismissJob}
              configured={data.configured}
              resultCount={data.resultCount}
              category={data.category}
              dismissedCount={data.dismissedCount}
              isAuthenticated={data.isAuthenticated}
              sortOrder={data.sortOrder}
              onSortOrderChange={data.onSortOrderChange}
              onCategoryChange={data.onCategoryChange}
            />
          ) : (
            <PublicJobResultsPanel data={data} onSelect={selectJob} />
          )}
        </div>
      </div>
      <PublicJobDetailDialog data={data} open={detailOpen} onClose={closeDetails} />
    </>
  );
}
