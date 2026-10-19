"use client";

import { Avatar, Box, ButtonBase, Chip, Stack, Typography } from "@mui/material";
import { CalendarDays, ChevronRight, MapPin } from "lucide-react";
import type { ReactNode } from "react";

export type JobCardData = {
  id: string;
  title: string;
  employer_name: string | null;
  location_text: string | null;
  work_mode: string | null;
  employment_type: string | null;
};

type Props = {
  job: JobCardData;
  /** Accepted for backwards compatibility; both routes render identically. */
  variant?: "public" | "authenticated";
  selected: boolean;
  postedLabel: string;
  onSelect: () => void;
  saveAction?: ReactNode;
};

export function JobCard({ job, selected, postedLabel, onSelect, saveAction }: Props) {
  const workMode = job.work_mode === "onsite" ? "On-site"
    : job.work_mode === "hybrid" ? "Hybrid"
    : job.work_mode === "remote" ? "Remote" : null;
  const tagSx = {
    height: 24,
    borderRadius: 1,
    fontSize: "0.7rem",
    bgcolor: "action.hover",
    color: "text.secondary",
    "& .MuiChip-icon": { ml: 0.75 },
  };

  return (
    <Box sx={{ display: "flex", alignItems: "stretch", gap: 1, minWidth: 0 }}>
      <ButtonBase
        component="button"
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        aria-label={`${job.title}, ${job.employer_name || "Employer not listed"}, ${job.location_text || "Location not specified"}`}
        sx={{
          display: "flex", flex: 1, minWidth: 0, alignItems: "flex-start",
          justifyContent: "flex-start", gap: 1.5, p: 1.75, border: 1,
          borderColor: selected ? "primary.main" : "divider", borderRadius: 2,
          bgcolor: selected ? "action.selected" : "background.paper",
          textAlign: "left", transition: "border-color 150ms, background-color 150ms",
          "&:hover": { borderColor: "primary.main", bgcolor: "action.hover" },
          "&:focus-visible": { outline: "2px solid", outlineColor: "primary.main", outlineOffset: 2 },
        }}
      >
        <Avatar variant="rounded" sx={{ width: 42, height: 42, bgcolor: "primary.main", color: "primary.contrastText", fontWeight: 700 }}>
          {(job.employer_name?.trim() || job.title || "?").slice(0, 1).toUpperCase()}
        </Avatar>
        <Stack spacing={0.6} sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.35, overflowWrap: "anywhere" }}>{job.title}</Typography>
          <Typography variant="body2" color="text.secondary">{job.employer_name || "Employer not listed"}</Typography>
          <Stack direction="row" spacing={0.5} alignItems="center" sx={{ color: "text.secondary", minWidth: 0 }}>
            <MapPin size={13} aria-hidden="true" />
            <Typography variant="caption" sx={{ overflowWrap: "anywhere" }}>{job.location_text || "Location not specified"}</Typography>
          </Stack>
          <Stack direction="row" spacing={0.6} useFlexGap flexWrap="wrap" sx={{ pt: 0.25 }}>
            <Chip size="small" label={job.employment_type?.replace(/[_-]+/g, " ") || "Opportunity"} sx={tagSx} />
            {workMode && <Chip size="small" label={workMode} sx={tagSx} />}
            <Chip size="small" icon={<CalendarDays size={12} />} label={postedLabel || "Date unknown"} sx={tagSx} />
          </Stack>
        </Stack>
        <Box sx={{ color: "text.secondary", pt: 0.5, display: "flex" }}><ChevronRight size={18} aria-hidden="true" /></Box>
      </ButtonBase>
      {saveAction && <Box sx={{ display: "flex", alignItems: "flex-start", pt: 0.5 }}>{saveAction}</Box>}
    </Box>
  );
}
