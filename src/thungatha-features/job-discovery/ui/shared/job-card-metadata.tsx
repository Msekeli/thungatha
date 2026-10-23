import { CalendarDays, MapPin } from "lucide-react";

export function JobCardMetadata({
  location,
  employmentType,
  posted,
  workMode,
}: {
  location?: string | null;
  employmentType?: string | null;
  posted?: string | null;
  workMode?: string | null;
}) {
  const employmentLabel =
    employmentType?.replace(/[_-]+/g, " ") || "Opportunity";
  const modeLabel =
    workMode === "onsite"
      ? "On-site"
      : workMode === "hybrid"
        ? "Hybrid"
        : workMode === "remote"
          ? "Remote"
          : null;
  return (
    <div className="flex w-full min-w-0 flex-col gap-1">
      <div className="flex min-w-0 flex-wrap items-start gap-x-2 gap-y-1">
        <span className="inline-flex min-w-0 items-center gap-1 break-words text-xs leading-tight text-fg-muted">
          <MapPin size={13} aria-hidden="true" />
          {location || "Location not specified"}
        </span>
        <span className="rounded-md bg-[var(--th-tag-bg)] px-2 py-0.5 text-[0.65rem] text-fg-muted">
          {employmentLabel}
        </span>
        {modeLabel && (
          <span className="rounded-md bg-[var(--th-tag-bg)] px-2 py-0.5 text-[0.65rem] text-fg-muted">
            {modeLabel}
          </span>
        )}
      </div>
      {posted && (
        <span className="inline-flex items-center gap-1 text-xs leading-tight text-fg-muted">
          <CalendarDays size={13} aria-hidden="true" />
          {posted}
        </span>
      )}
    </div>
  );
}
