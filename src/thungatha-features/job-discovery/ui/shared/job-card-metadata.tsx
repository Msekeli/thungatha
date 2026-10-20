import { CalendarDays, MapPin } from "lucide-react";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

export function JobCardMetadata({
  location,
  employmentType,
  posted,
  workMode,
}: {
  location?: string | null;
  employmentType?: string | null;
  posted?: string | null;
  workMode?: string | null;
}) {
  const employmentLabel =
    employmentType?.replace(/[_-]+/g, " ") || "Opportunity";
  const modeLabel =
    workMode === "onsite"
      ? "On-site"
      : workMode === "hybrid"
        ? "Hybrid"
        : workMode === "remote"
          ? "Remote"
          : null;
  return (
    <Stack spacing={0.45} sx={{ minWidth: 0, width: "100%" }}>
      <Stack
        direction="row"
        sx={{
          minWidth: 0,
          flexWrap: "wrap",
          alignItems: "flex-start",
          columnGap: 0.8,
          rowGap: 0.35,
        }}
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
        <Chip size="small" label={employmentLabel} sx={chipSx} />
        {modeLabel && <Chip size="small" label={modeLabel} sx={chipSx} />}
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

const chipSx = {
  height: 20,
  borderRadius: 1,
  fontSize: "0.65rem",
  bgcolor: "action.hover",
  color: "text.secondary",
};
