"use client";
import Box from "@mui/material/Box";
import type { ReactNode } from "react";
import { JobCardButton } from "./job-card-button";
export type JobCardData = {
  id: string; title: string; employer_name: string | null;
  location_text: string | null; work_mode: string | null; employment_type: string | null;
};
type Props = {
  job: JobCardData; variant?: "public" | "authenticated"; selected: boolean;
  postedLabel: string; onSelect: () => void; saveAction?: ReactNode;
};
export function JobCard({ job, selected, postedLabel, onSelect, saveAction }: Props) {
  return <Box sx={{ position: "relative", minWidth: 0 }}>
    <JobCardButton job={job} selected={selected} postedLabel={postedLabel} onSelect={onSelect} />
    {saveAction && <Box className="th-job-card-actions"
      sx={{ position: "absolute", top: 6, right: 6, display: "flex", flexDirection: "column", gap: 0.25 }}>
      {saveAction}
    </Box>}
  </Box>;
}