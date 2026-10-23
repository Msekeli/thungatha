import { JobMetadata } from "./job-metadata";
import type { JobCardData } from "./job-opportunity-card";

export function JobCardButton({
  job,
  selected,
  postedLabel,
  onSelect,
}: {
  job: JobCardData;
  selected: boolean;
  postedLabel: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={`${job.title}, ${job.employer_name || "Employer not listed"}, ${job.location_text || "Location not specified"}`}
      className={`flex w-full min-w-0 items-center gap-3 rounded-3xl border p-3 pr-12 text-left transition-colors hover:border-[var(--th-accent)] hover:bg-[var(--th-panel-2)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--th-accent)] ${selected ? "border-[var(--th-accent)] bg-[var(--th-selected)]" : "border-[var(--th-line)] bg-[var(--th-panel)]"}`}
    >
      <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--th-btn)] text-xl font-bold text-[var(--th-btn-fg)]">
        {(job.employer_name?.trim() || job.title || "?")
          .slice(0, 1)
          .toUpperCase()}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="break-words text-base font-bold leading-tight text-[var(--th-fg)]">{job.title}</span>
        <span className="text-sm text-[var(--th-fg-muted)]">{job.employer_name || "Employer not listed"}</span>
        <JobMetadata
          location={job.location_text}
          employmentType={job.employment_type}
          workMode={job.work_mode}
          posted={postedLabel}
          presentation="card"
        />
      </span>
    </button>
  );
}
