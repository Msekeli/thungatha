import { Avatar, Box, ButtonBase, Stack, Typography } from "@mui/material";
import { ChevronRight } from "lucide-react";
import { JobMetadata } from "./job-metadata";
import type { JobCardData } from "./job-card";

export function JobCardButton({
  job,
  selected,
  postedLabel,
  onSelect,
}: {
  job: JobCardData;
  selected: boolean;
  postedLabel: string;
  onSelect: () => void;
}) {
  return (
    <ButtonBase
      component="button"
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={`${job.title}, ${job.employer_name || "Employer not listed"}, ${job.location_text || "Location not specified"}`}
      sx={{
        display: "flex",
        flex: 1,
        minWidth: 0,
        alignItems: "flex-start",
        justifyContent: "flex-start",
        gap: 1.5,
        p: 1.75,
        border: 1,
        borderColor: selected ? "primary.main" : "divider",
        borderRadius: 2,
        bgcolor: selected ? "action.selected" : "background.paper",
        textAlign: "left",
        transition: "border-color 150ms, background-color 150ms",
        "&:hover": { borderColor: "primary.main", bgcolor: "action.hover" },
        "&:focus-visible": {
          outline: "2px solid",
          outlineColor: "primary.main",
          outlineOffset: 2,
        },
      }}
    >
      <Avatar
        variant="rounded"
        sx={{
          width: 42,
          height: 42,
          bgcolor: "primary.main",
          color: "primary.contrastText",
          fontWeight: 700,
        }}
      >
        {(job.employer_name?.trim() || job.title || "?")
          .slice(0, 1)
          .toUpperCase()}
      </Avatar>
      <Stack spacing={0.6} sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 700, lineHeight: 1.35, overflowWrap: "anywhere" }}
        >
          {job.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {job.employer_name || "Employer not listed"}
        </Typography>
        <JobMetadata
          location={job.location_text}
          employmentType={job.employment_type}
          workMode={job.work_mode}
          posted={postedLabel}
          presentation="card"
        />
      </Stack>
      <Box sx={{ color: "text.secondary", pt: 0.5, display: "flex" }}>
        <ChevronRight size={18} aria-hidden="true" />
      </Box>
    </ButtonBase>
  );
}
