import { CalendarDays, MapPin, BriefcaseBusiness } from "lucide-react";
import { JobCardMetadata } from "./job-card-metadata";

type Props = {
  location?: string | null;
  employmentType?: string | null;
  posted?: string | null;
  workMode?: string | null;
  presentation?: "inline" | "card";
};

export function JobMetadata({
  location,
  employmentType,
  posted,
  workMode,
  presentation = "inline",
}: Props) {
  if (presentation === "card")
    return (
      <JobCardMetadata
        location={location}
        employmentType={employmentType}
        posted={posted}
        workMode={workMode}
      />
    );
  const items = [
    { label: location || "Location not specified", icon: MapPin },
    {
      label:
        employmentType?.replace(/[_-]+/g, " ") ||
        "Employment type not specified",
      icon: BriefcaseBusiness,
    },
    ...(posted ? [{ label: posted, icon: CalendarDays }] : []),
    ...(workMode ? [{ label: workMode, icon: MapPin }] : []),
  ];
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1.5">
      {items.map(({ label, icon: Icon }) => (
        <span key={label} className="inline-flex items-center gap-1 text-xs text-fg-muted">
          <Icon size={13} aria-hidden="true" /> {label}
        </span>
      ))}
    </div>
  );
}
