import { BriefcaseBusiness, CalendarDays, Clock3, MapPin } from "lucide-react";

type Props = {
  location?: string | null;
  employmentType?: string | null;
  workMode?: string | null;
  postedAt?: string | null;
  formatDate: (value: string | null | undefined) => string | null;
};

function shown(value?: string | null) { return value?.trim() || "Not provided"; }

export function JobDetailMeta({ location, employmentType, workMode, postedAt, formatDate }: Props) {
  const mode = workMode === "onsite" ? "On-site" : workMode === "hybrid" ? "Hybrid" : workMode === "remote" ? "Remote" : "Work mode not stated";
  return (
    <div className="th-jobs-detail-meta">
      <span><MapPin size={13} /> {shown(location)}</span>
      <span><BriefcaseBusiness size={13} /> {shown(employmentType)}</span>
      <span><Clock3 size={13} /> {mode}</span>
      <span><CalendarDays size={13} /> Posted {formatDate(postedAt) || "date unknown"}</span>
    </div>
  );
}
