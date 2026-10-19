import { Box, Chip, Stack } from "@mui/material";
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

export function JobDetailMeta({ location, employmentType, workMode, postedAt, formatDate }: Props) {
  const mode = workMode === "onsite" ? "On-site" : workMode === "hybrid" ? "Hybrid" : workMode === "remote" ? "Remote" : "Work mode not stated";
  const items = [
    { icon: <MapPin size={14} />, label: shown(location) },
    { icon: <BriefcaseBusiness size={14} />, label: shown(employmentType) },
    { icon: <Clock3 size={14} />, label: mode },
    { icon: <CalendarDays size={14} />, label: `Posted ${formatDate(postedAt) || "date unknown"}` },
  ];

  return (
    <Stack direction="row" spacing={1} sx={{ py: 1, display: "flex", flexWrap: "wrap", gap: 1 }}>
      {items.map((item) => (
        <Chip key={item.label} icon={item.icon} label={item.label} size="small" variant="outlined"
          sx={{ maxWidth: "100%", height: "auto", py: 0.4, "& .MuiChip-label": { whiteSpace: "normal", overflowWrap: "anywhere" } }} />
      ))}
    </Stack>
  );
}
