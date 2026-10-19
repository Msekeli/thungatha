import { CalendarDays, MapPin, BriefcaseBusiness } from "lucide-react";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

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
  const cardMode =
    workMode === "onsite"
      ? "On-site"
      : workMode === "hybrid"
        ? "Hybrid"
        : workMode === "remote"
          ? "Remote"
          : null;
  if (presentation === "card") {
    const tags = [
      { label: employmentType?.replace(/[_-]+/g, " ") || "Opportunity" },
      ...(cardMode ? [{ label: cardMode }] : []),
      { label: posted || "Date unknown", icon: CalendarDays },
    ];
    return (
      <Stack spacing={0.25}>
        <Typography
          variant="caption"
          color="text.secondary"
          className="inline-flex items-center gap-1"
        >
          <MapPin size={13} aria-hidden="true" />{" "}
          {location || "Location not specified"}
        </Typography>
        <Stack
          direction="row"
          spacing={0.6}
          sx={{ pt: 0.1, flexWrap: "wrap", gap: 0.4 }}
        >
          {tags.map(({ label, icon: Icon }) => (
            <Chip
              key={label}
              size="small"
              icon={Icon ? <Icon size={12} /> : undefined}
              label={label}
              sx={{
                height: 20,
                borderRadius: 1,
                fontSize: "0.65rem",
                bgcolor: "action.hover",
                color: "text.secondary",
                "& .MuiChip-icon": { ml: 0.75 },
              }}
            />
          ))}
        </Stack>
      </Stack>
    );
  }
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
