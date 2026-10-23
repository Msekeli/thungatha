import { BriefcaseBusiness, CalendarDays, Clock3, MapPin } from "lucide-react";

type Props = {
  location?: string | null;
  employmentType?: string | null;
  workMode?: string | null;
  postedAt?: string | null;
  formatDate: (value: string | null | undefined) => string | null;
};

function shown(value?: string | null) {
  return value?.trim() || "Not provided";
}

export function JobDetailMeta({
  location,
  employmentType,
  workMode,
  postedAt,
  formatDate,
}: Props) {
  const mode =
    workMode === "onsite"
      ? "On-site"
      : workMode === "hybrid"
        ? "Hybrid"
        : workMode === "remote"
          ? "Remote"
          : "Work mode not stated";
  const items = [
    { icon: MapPin, label: shown(location) },
    { icon: BriefcaseBusiness, label: shown(employmentType) },
    { icon: Clock3, label: mode },
    {
      icon: CalendarDays,
      label: `Posted ${formatDate(postedAt) || "date unknown"}`,
    },
  ];

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
