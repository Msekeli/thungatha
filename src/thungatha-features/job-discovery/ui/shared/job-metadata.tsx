import { CalendarDays, MapPin, BriefcaseBusiness } from "lucide-react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

type Props = {
  location?: string | null;
  employmentType?: string | null;
  posted?: string | null;
  workMode?: string | null;
};

export function JobMetadata({
  location,
  employmentType,
  posted,
  workMode,
}: Props) {
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
    <Stack direction="row" sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
      {items.map(({ label, icon: Icon }) => (
        <Typography
          key={label}
          variant="caption"
          color="text.secondary"
          className="inline-flex items-center gap-1"
        >
          <Icon size={13} aria-hidden="true" /> {label}
        </Typography>
      ))}
    </Stack>
  );
}
