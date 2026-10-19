"use client";

import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { BookmarkCheck, BriefcaseBusiness } from "lucide-react";

type Props = {
  value: "all" | "saved";
  savedCount?: number;
  onChange: (value: "all" | "saved") => void;
};

export function JobSavedJobsToggle({ value, savedCount = 0, onChange }: Props) {
  return (
    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
      <Button
        variant={value === "all" ? "contained" : "outlined"}
        startIcon={<BriefcaseBusiness size={16} />}
        onClick={() => onChange("all")}
      >
        All jobs
      </Button>
      <Button
        variant={value === "saved" ? "contained" : "outlined"}
        startIcon={<BookmarkCheck size={16} />}
        onClick={() => onChange("saved")}
      >
        Saved ({savedCount})
      </Button>
    </Stack>
  );
}
