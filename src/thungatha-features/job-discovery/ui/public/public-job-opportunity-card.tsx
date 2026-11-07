import { ArrowUpRight, Clock3, MapPin } from "lucide-react";
import type { ReactNode } from "react";
import type { JobCardData } from "../shared/job-opportunity-card";

export function PublicJobOpportunityCard({
  job,
  ageDays,
  postedLabel,
  onSelect,
  actions,
}: {
  job: JobCardData;
  ageDays: number | null;
  postedLabel: string;
  onSelect: () => void;
  actions?: ReactNode;
}) {
  const employer = job.employer_name?.trim() || "Employer not listed";
  const initials = employer.split(/\\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();

  return (
    <article className="group/card relative flex w-[98%] min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border border-public-card-border bg-public-card-bg shadow-public-card transition-[transform,border-color,box-shadow] duration-200 ease-out hover:-translate-y-1 hover:border-card-hover hover:shadow-card-hover hover:cursor-pointer motion-reduce:transition-none motion-reduce:hover:transform-none">
      <button type="button" onClick={onSelect} aria-label={`View ${job.title} at ${employer}`} className="absolute inset-0 z-0 cursor-pointer rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-accent-on-navy" />
      <div className="pointer-events-none relative z-10 flex min-h-16 min-w-0 items-center gap-2 border-b-public-band border-public-band-border bg-gradient-to-br from-public-band-from to-public-band-to p-2.5 text-left transition-[filter] duration-200 group-hover/card:brightness-110">
        {job.company_logo_url ? (
          <img src={job.company_logo_url} alt="" className="size-9 shrink-0 rounded-panel border border-logo-border bg-white object-contain p-0.5" />
        ) : (
          <span className="flex size-9 shrink-0 items-center justify-center rounded-panel border border-logo-border bg-logo-bg text-job font-bold text-logo-fg">{initials || "?"}</span>
        )}
        <span className="min-w-0 flex-1">
          <span className="line-clamp-2 block text-job font-semibold text-on-band decoration-accent-on-navy/60 underline-offset-4 group-hover/card:underline">{job.title}</span>
          <span className="mt-1 block truncate text-control text-on-band-muted">{employer}</span>
        </span>
        <ArrowUpRight size={22} aria-hidden="true" className="shrink-0 text-accent-on-navy opacity-50 transition-all duration-200 group-hover/card:-translate-y-0.5 group-hover/card:translate-x-0.5 group-hover/card:opacity-100" />
      </div>
      <div className="pointer-events-none relative z-10 flex flex-1 flex-col gap-1.5 px-3 pb-1.5 pt-1.5">
        <span className="inline-flex min-w-0 items-center gap-2 self-start rounded-lg bg-public-location-bg px-2 py-1 text-detail text-public-location-text">
          <MapPin size={14} aria-hidden="true" />
          <span className="break-words">{job.location_text || "Location not specified"}</span>
        </span>
        <div className="mt-auto flex items-center justify-between gap-2 border-t border-public-card-border pt-1.5">
          {ageDays !== null && ageDays <= 3 ? (
            <span className="inline-flex items-center rounded-md bg-success-bg px-2 py-1 text-[length:var(--text-tag)] font-semibold text-success">{postedLabel}</span>
          ) : (
            <span className="inline-flex items-center gap-1 text-detail text-public-muted"><Clock3 size={13} aria-hidden="true" />{postedLabel}</span>
          )}
          <div className="pointer-events-auto relative z-20 flex shrink-0 items-center gap-1">{actions}</div>
        </div>
      </div>
    </article>
  );
}
