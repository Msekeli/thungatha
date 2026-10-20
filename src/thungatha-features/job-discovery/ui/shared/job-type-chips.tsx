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
    <Stack
      direction="row"
      spacing={1}
      sx={{
        display: "flex",
        flexWrap: "wrap",
        gap: 1,
        justifyContent: "center",
      }}
    >
      {options.map((option) => (
        <Chip
          key={option.value}
          label={
            option.count == null
              ? option.label
              : `${option.label} ${option.count}`
          }
          color={value === option.value ? "primary" : "default"}
          variant={value === option.value ? "filled" : "outlined"}
          clickable
          onClick={() => onChange(option.value)}
          aria-pressed={value === option.value}
          sx={{
            height: 40,
            borderRadius: "999px",
            px: 1.1,
            fontWeight: 600,
            borderColor: value === option.value ? "primary.main" : "divider",
            color: value === option.value ? "primary.main" : "text.primary",
            backgroundColor:
              value === option.value ? "rgba(0,188,242,.12)" : "transparent",
            "& .MuiChip-label": { px: 1.1 },
          }}
        />
      ))}
    </Stack>
  );
}
