import { CalendarDays, MapPin } from "lucide-react";

export function JobCardMetadata({
  location,
  posted,
}: {
  location?: string | null;
  posted?: string | null;
}) {
  return (
    <div className="flex w-full min-w-0 flex-col gap-1">
      {location && (
        <span className="inline-flex min-w-0 items-center gap-1 break-words text-xs leading-tight text-fg-muted">
          <MapPin size={13} aria-hidden="true" />
          {location}
        </span>
      )}
      {posted && (
        <span className="inline-flex items-center gap-1 text-xs leading-tight text-fg-muted">
          <CalendarDays size={13} aria-hidden="true" />
          {posted}
        </span>
      )}
    </div>
  );
}
