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
    const employmentLabel =
      employmentType?.replace(/[_-]+/g, " ") || "Opportunity";
    const modeLabel = cardMode;
    return (
      <Stack spacing={0.45} sx={{ minWidth: 0, width: "100%" }}>
        <Stack
          direction="row"
          alignItems="flex-start"
          sx={{ minWidth: 0, flexWrap: "wrap", columnGap: 0.8, rowGap: 0.35 }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            className="inline-flex items-center gap-1"
            sx={{ minWidth: 0, lineHeight: 1.3, overflowWrap: "anywhere" }}
          >
            <MapPin size={13} aria-hidden="true" />
            {location || "Location not specified"}
          </Typography>
          <Chip
            size="small"
            label={employmentLabel}
            sx={{
              height: 20,
              borderRadius: 1,
              fontSize: "0.65rem",
              bgcolor: "action.hover",
              color: "text.secondary",
            }}
          />
          {modeLabel && (
            <Chip
              size="small"
              label={modeLabel}
              sx={{
                height: 20,
                borderRadius: 1,
                fontSize: "0.65rem",
                bgcolor: "action.hover",
                color: "text.secondary",
              }}
            />
          )}
        </Stack>
        {posted && (
          <Typography
            variant="caption"
            color="text.secondary"
            className="inline-flex items-center gap-1"
            sx={{ lineHeight: 1.3 }}
          >
            <CalendarDays size={13} aria-hidden="true" />
            {posted}
          </Typography>
        )}
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
