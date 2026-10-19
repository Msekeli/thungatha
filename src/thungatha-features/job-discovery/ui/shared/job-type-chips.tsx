"use client";

import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";

export type JobTypeOption = { label: string; value: string; count?: number };

type JobTypeChipsProps = {
  options: JobTypeOption[];
  value: string;
  onChange: (value: string) => void;
};

export function JobTypeChips({ options, value, onChange }: JobTypeChipsProps) {
  return (
    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
      {options.map((option) => (
        <Chip
          key={option.value}
          label={option.count == null ? option.label : `${option.label} ${option.count}`}
          color={value === option.value ? "primary" : "default"}
          variant={value === option.value ? "filled" : "outlined"}
          clickable
          onClick={() => onChange(option.value)}
          aria-pressed={value === option.value}
        />
      ))}
    </Stack>
  );
}
