"use client";

import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
} from "@mui/material";

export type JobFilterOption = { label: string; value: string };

export type JobFilterField = {
  label: string;
  value: string;
  options: JobFilterOption[];
  onChange: (value: string) => void;
};

type JobFiltersProps = { fields: JobFilterField[] };

export function JobFilters({ fields }: JobFiltersProps) {
  return (
    <Stack spacing={2}>
      {fields.map((field) => (
        <FormControl fullWidth size="small" key={field.label}>
          <InputLabel>{field.label}</InputLabel>
          <Select
            label={field.label}
            value={field.value}
            onChange={(event) => field.onChange(event.target.value)}
          >
            {field.options.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      ))}
    </Stack>
  );
}
