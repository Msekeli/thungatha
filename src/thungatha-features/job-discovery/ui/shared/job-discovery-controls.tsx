"use client";

import { Chip, FormControl, MenuItem, Select, Stack } from "@mui/material";

export const JOB_TYPE_OPTIONS = [
  { key: "all", label: "All opportunities" },
  { key: "full-time", label: "Full-time" },
  { key: "part-time", label: "Part-time" },
  { key: "contract", label: "Contract" },
  { key: "internship", label: "Internships" },
  { key: "learnership", label: "Learnerships" },
  { key: "graduate", label: "Graduate programmes" },
] as const;

export function JobLocationSelect({
  value,
  onChange,
  compact = false,
  emptyMeansDefault = false,
  anywhereValue = "Anywhere",
}: {
  value: string;
  onChange: (value: string) => void;
  compact?: boolean;
  emptyMeansDefault?: boolean;
  anywhereValue?: string;
}) {
  return (
    <FormControl size="small" sx={{ minWidth: 0, width: compact ? "100%" : { xs: "100%", sm: 220 }, flex: compact ? 1 : "0 0 auto" }}>
      <Select
        displayEmpty
        value={value || (emptyMeansDefault ? "Cape Town + 50 km" : value)}
        onChange={(event) => {
          const next = event.target.value;
          onChange(emptyMeansDefault && next === "Cape Town + 50 km" ? "" : next);
        }}
        inputProps={{ "aria-label": "Search location" }}
        sx={{
          height: 44,
          borderRadius: "12px",
          bgcolor: "background.paper",
          fontSize: 14,
          "& .MuiOutlinedInput-notchedOutline": { borderColor: "divider" },
        }}
      >
        <MenuItem value="Cape Town + 50 km">Cape Town + 50 km</MenuItem>
        <MenuItem value="Cape Town">Cape Town</MenuItem>
        <MenuItem value="Johannesburg">Johannesburg</MenuItem>
        <MenuItem value="Durban">Durban</MenuItem>
        <MenuItem value="Remote">Remote</MenuItem>
        <MenuItem value={anywhereValue}>Anywhere</MenuItem>
      </Select>
    </FormControl>
  );
}

export function JobTypeChips({
  activeKey,
  onSelect,
  counts = {},
  showAllCount = false,
  justifyContent = "flex-start",
}: {
  activeKey: string;
  onSelect: (key: string, label: string) => void;
  counts?: Record<string, number | null>;
  showAllCount?: boolean;
  justifyContent?: "flex-start" | "center";
}) {
  return (
    <Stack
      direction="row"
      spacing={1}
      role="group"
      aria-label="Job types"
      sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent, gap: 1 }}
    >
      {JOB_TYPE_OPTIONS.map((item) => {
        const active = activeKey === item.key;
        const count = counts[item.key];
        const label = showAllCount && item.key === "all" && count != null
          ? `${item.label} · ${count}`
          : count != null
            ? `${item.label} · ${count}`
            : item.label;
        return (
          <Chip
            key={item.key}
            clickable
            label={label}
            color={active ? "primary" : "default"}
            variant={active ? "filled" : "outlined"}
            onClick={() => onSelect(item.key, item.label)}
            sx={{
              height: 30,
              borderRadius: "999px",
              px: 1.1,
              fontWeight: 600,
              borderColor: active ? "primary.main" : "divider",
              color: active ? "primary.main" : "text.primary",
              bgcolor: active ? "rgba(0,188,242,.12)" : "transparent",
              "& .MuiChip-label": { px: 1.1 },
            }}
          />
        );
      })}
    </Stack>
  );
}
