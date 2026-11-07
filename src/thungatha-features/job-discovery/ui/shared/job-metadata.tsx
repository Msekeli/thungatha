import { CalendarDays, MapPin } from "lucide-react";

type Props = {
  location?: string | null;
  posted?: string | null;
};

export function JobMetadata({ location, posted }: Props) {
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1.5">
      {location && (
        <span className="inline-flex items-center gap-1 text-xs text-fg-muted">
          <MapPin size={13} aria-hidden="true" /> {location}
        </span>
      )}
      {posted && (
        <span className="inline-flex items-center gap-1 text-xs text-fg-muted">
          <CalendarDays size={13} aria-hidden="true" /> {posted}
        </span>
      )}
    </div>
  );
}
