import { ArrowUpRight, MapPin } from "lucide-react";
import type { ReactNode } from "react";
import type { JobCardData } from "./job-opportunity-card";

function ageTone(days: number | null) {
  if (days === null) return "border border-line bg-transparent text-fg-muted";
  if (days <= 7) return "border border-success bg-transparent text-success";
  if (days <= 14) return "border border-warn bg-transparent text-warn";
  if (days <= 30) return "border border-caution bg-transparent text-caution";
  return "border border-danger bg-transparent text-danger";
}

export function PublicJobOpportunityCard({
  job, postedLabel, ageDays, onSelect, actions,
}: {
  job: JobCardData;
  postedLabel: string;
  ageDays: number | null;
  onSelect: () => void;
  actions?: ReactNode;
}) {
  const employer = job.employer_name?.trim() || "Employer not listed";
  return (
    <article className="group/card relative flex min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border border-public-card-border bg-public-card-bg shadow-public-card transition-[transform,border-color,box-shadow] duration-200 ease-out hover:-translate-y-1 hover:border-card-hover hover:shadow-card-hover motion-reduce:transition-none motion-reduce:hover:transform-none">
      <button type="button" onClick={onSelect} aria-label={`View ${job.title} at ${employer}`} className="absolute inset-0 z-0 rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-accent-on-navy" />
      <div className="pointer-events-none relative z-10 flex min-h-16 min-w-0 items-center gap-2 border-b-public-band border-public-band-border bg-gradient-to-br from-public-band-from to-public-band-to p-2.5 text-left transition-[filter] duration-200 group-hover/card:brightness-110">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-panel border border-logo-border bg-logo-bg text-job font-bold text-logo-fg transition-transform duration-200 group-hover/card:scale-105">
          {employer.slice(0, 1).toUpperCase()}
        </span>
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
          <span className={`inline-flex items-center gap-2 rounded-md px-2.5 py-1 text-detail font-semibold ${ageTone(ageDays)}`}><i aria-hidden="true" className="size-2 rounded-full bg-current" />{postedLabel}</span>
          <div className="pointer-events-auto relative z-20 flex shrink-0 items-center gap-1">{actions}</div>
        </div>
      </div>
    </article>
  );
}
