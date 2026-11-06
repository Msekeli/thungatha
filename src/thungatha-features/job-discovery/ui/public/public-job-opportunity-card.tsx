import { MapPin } from "lucide-react";
import type { ReactNode } from "react";
import type { JobCardData } from "./job-opportunity-card";

function ageTone(label: string) {
  const days = Number(label.match(/\d+/)?.[0] ?? 0);
  if (/unknown/i.test(label)) return "bg-tag text-fg-muted";
  if (days <= 7) return "bg-age-fresh-bg text-age-fresh";
  if (days <= 14) return "bg-age-recent-bg text-age-recent";
  if (days <= 30) return "bg-age-aging-bg text-age-aging";
  return "bg-age-stale-bg text-age-stale";
}

export function PublicJobOpportunityCard({
  job,
  postedLabel,
  onSelect,
  actions,
}: {
  job: JobCardData;
  postedLabel: string;
  onSelect: () => void;
  actions?: ReactNode;
}) {
  const employer = job.employer_name?.trim() || "Employer not listed";
  return (
    <article className="flex min-w-0 flex-col overflow-hidden rounded-card border border-card-border bg-card shadow-card transition-colors hover:border-card-hover hover:shadow-card-hover">
      <button
        type="button"
        onClick={onSelect}
        aria-label={`View ${job.title} at ${employer}`}
        className="flex min-h-24 min-w-0 items-center gap-3 border-b-band border-band-line bg-gradient-to-br from-band-from to-band-to p-4 text-left focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-accent-on-navy"
      >
        <span className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-logo-border bg-logo-bg text-xl font-bold text-logo-fg">
          {(employer || job.title).slice(0, 1).toUpperCase()}
        </span>
        <span className="min-w-0 flex-1">
          <span className="line-clamp-2 block text-card-title font-semibold text-on-band">
            {job.title}
          </span>
          <span className="mt-1 block truncate text-card-company text-on-band-muted">
            {employer}
          </span>
        </span>
      </button>
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="flex min-w-0 flex-wrap gap-2 text-card-meta text-fg-muted">
          <span className="inline-flex min-w-0 items-center gap-1">
            <MapPin size={14} aria-hidden="true" />
            <span className="break-words">{job.location_text || "Location not specified"}</span>
          </span>
          {job.employment_type && <span className="rounded-md bg-panel-2 px-2 py-1">{job.employment_type.replace(/[_-]+/g, " ")}</span>}
          {job.work_mode && <span className="rounded-md bg-panel-2 px-2 py-1">{job.work_mode}</span>}
        </div>
        <div className="mt-auto flex items-center justify-between gap-2 border-t border-line pt-3">
          <span className={`inline-flex items-center rounded-pill px-3 py-1 text-xs font-semibold ${ageTone(postedLabel)}`}>
            {postedLabel}
          </span>
          <div className="flex shrink-0 items-center gap-1">{actions}</div>
        </div>
      </div>
    </article>
  );
}
