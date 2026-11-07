"use client";

import { useState } from "react";
import type { Job } from "../job-discovery-utils";
import type { JobDiscoveryWorkspaceProps } from "../shared/job-discovery-workspace-types";
import { PublicJobResultsPanel } from "./public-job-results-panel";
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
        ? "grid min-h-0 min-w-0 grid-cols-1 gap-5 min-[1200px]:grid-cols-[261px_minmax(0,1fr)]"
        : "grid min-h-0 min-w-0 grid-cols-1"}>
        {data.leadingColumn}
        <div className="min-w-0">
          <PublicJobResultsPanel data={data} onSelect={selectJob} />
        </div>
      </div>
      <PublicJobDetailDialog data={data} open={detailOpen} onClose={closeDetails} />
    </>
  );
}
