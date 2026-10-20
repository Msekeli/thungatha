"use client";

import { Button, Stack } from "@mui/material";
import { JobFilterFields } from "../shared/job-filter-fields";

export function PublicJobFiltersPanel({
  modesSelected,
  setModesSelected,
  experience,
  setExperience,
  employmentType,
  setEmploymentType,
  publishedWithin,
  setPublishedWithin,
  onClose,
  onClear,
}: {
  modesSelected: string[];
  setModesSelected: (value: string[]) => void;
  experience: string;
  setExperience: (value: string) => void;
  employmentType: string;
  setEmploymentType: (value: string) => void;
  publishedWithin: string;
  setPublishedWithin: (value: string) => void;
  onClose: () => void;
  onClear: () => void;
}) {
  return (
    <Stack spacing={1.25} className="th-filter-content">
      <JobFilterFields
        workMode={modesSelected}
        onWorkModeChange={(value) => setModesSelected(Array.isArray(value) ? value : value ? [value] : [])}
        employmentType={employmentType || "all"}
        onEmploymentTypeChange={setEmploymentType}
        publishedWithin={publishedWithin}
        onPublishedWithinChange={setPublishedWithin}
        experience={experience}
        onExperienceChange={setExperience}
      />
      <Stack direction="row" justifyContent="space-between" sx={{ pt: 0.5 }}>
        <Button variant="text" size="small" onClick={onClear}>Reset</Button>
        <Button variant="contained" size="small" onClick={onClose}>Done</Button>
      </Stack>
    </Stack>
  );
}
