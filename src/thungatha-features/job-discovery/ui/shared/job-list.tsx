import { JobCard, type JobCardData } from "./job-card";

export type JobListVariant = "public" | "authenticated";

type Props<T extends JobCardData> = {
  jobs: T[];
  variant: JobListVariant;
  selectedId: string | null;
  getPostedLabel: (job: T) => string;
  onSelect: (job: T) => void;
};

export function JobList<T extends JobCardData>({
  jobs,
  variant,
  selectedId,
  getPostedLabel,
  onSelect,
}: Props<T>) {
  return (
    <>
      {jobs.map((job) => (
        <JobCard
          key={job.id}
          job={job}
          variant={variant}
          selected={job.id === selectedId}
          postedLabel={getPostedLabel(job)}
          onSelect={() => onSelect(job)}
        />
      ))}
    </>
  );
}
