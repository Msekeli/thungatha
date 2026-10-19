"use client";

import { JobCard, type JobCardData } from "../shared/job-card";

type JobListItem = { job: JobCardData; postedLabel: string };
type Props = {
  jobs: JobListItem[];
  selectedId: string | null;
  onSelect: (jobId: string) => void;
};

export function PublicJobDiscoveryJobList({ jobs, selectedId, onSelect }: Props) {
  return (
    <div className="th-job-list">
      {jobs.map(({ job, postedLabel }) => (
        <JobCard
          key={job.id}
          job={job}
          variant="public"
          selected={selectedId === job.id}
          postedLabel={postedLabel}
          onSelect={() => onSelect(job.id)}
        />
      ))}
    </div>
  );
}
