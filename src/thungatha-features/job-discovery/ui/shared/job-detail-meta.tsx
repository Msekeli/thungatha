import { CalendarDays, MapPin } from "lucide-react";
import "./job-detail-meta.css";

type Props = {
  location?: string | null;
  postedAt?: string | null;
  formatDate: (value: string | null | undefined) => string | null;
};

export function JobDetailMeta({ location, postedAt, formatDate }: Props) {
  const postedDate = formatDate(postedAt);
  const items = [
    location?.trim() ? { icon: MapPin, label: location.trim() } : null,
    postedDate
      ? { icon: CalendarDays, label: `Published ${postedDate}` }
      : null,
  ].filter((item) => item !== null);

  if (items.length === 0) return null;

  return (
    <div className="th-job-detail-meta" aria-label="Job metadata">
      {items.map(({ icon: Icon, label }, index) => (
        <span className="th-job-detail-meta-item" key={`${index}-${label}`}>
          <Icon size={14} aria-hidden="true" />
          <span>{label}</span>
        </span>
      ))}
    </div>
  );
}
