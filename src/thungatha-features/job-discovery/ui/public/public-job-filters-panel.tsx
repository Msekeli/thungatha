"use client";

import { useState } from "react";
import {
  Button,
  Checkbox,
  FormControlLabel,
  Stack,
  Typography,
} from "@mui/material";
import { ChevronDown, ChevronUp } from "lucide-react";

type FilterOption = { label: string; value: string };
const modes: FilterOption[] = [
  { label: "Remote", value: "remote" },
  { label: "Hybrid", value: "hybrid" },
  { label: "On-site", value: "onsite" },
];
const salaryOptions: FilterOption[] = [
  { label: "Any salary", value: "any" },
  { label: "Salary disclosed", value: "disclosed" },
  { label: "R500,000+ per year", value: "above50" },
];
const experienceOptions: FilterOption[] = [
  { label: "Any level", value: "any" },
  { label: "Entry level", value: "entry" },
  { label: "Mid-level", value: "mid" },
  { label: "Senior", value: "senior" },
];

function InlineFilterDropdown({
  label,
  value,
  options,
  onChange,
  open,
  onToggle,
}: {
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
  open: boolean;
  onToggle: () => void;
}) {
  const selected = options.find((option) => option.value === value) ?? options[0];
  return (
    <Stack spacing={0.5} className="th-filter-dropdown">
      <Button
        fullWidth
        variant="outlined"
        onClick={onToggle}
        aria-expanded={open}
        sx={{
          justifyContent: "space-between",
          minHeight: 40,
          px: 1.25,
          textTransform: "none",
          borderColor: "var(--th-line)",
          color: "var(--th-fg)",
        }}
      >
        <Stack alignItems="flex-start" spacing={0} sx={{ minWidth: 0 }}>
          <Typography variant="caption" sx={{ color: "var(--th-fg-muted)" }}>
            {label}
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {selected.label}
          </Typography>
        </Stack>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </Button>
      {open && (
        <Stack
          role="listbox"
          aria-label={label}
          spacing={0.25}
          sx={{
            p: 0.5,
            border: "1px solid var(--th-line)",
            borderRadius: 1.5,
            bgcolor: "var(--th-panel)",
          }}
        >
          {options.map((option) => (
            <Button
              key={option.value}
              fullWidth
              role="option"
              aria-selected={value === option.value}
              variant="text"
              onClick={() => {
                onChange(option.value);
                onToggle();
              }}
              sx={{
                justifyContent: "flex-start",
                minHeight: 36,
                px: 1,
                textTransform: "none",
                color: "var(--th-fg)",
                bgcolor: value === option.value ? "var(--th-tag-bg)" : "transparent",
              }}
            >
              {option.label}
            </Button>
          ))}
        </Stack>
      )}
    </Stack>
  );
}

export function PublicJobFiltersPanel({
  modesSelected,
  setModesSelected,
  salary,
  setSalary,
  experience,
  setExperience,
  onClose,
  onClear,
}: {
  modesSelected: string[];
  setModesSelected: (value: string[]) => void;
  salary: string;
  setSalary: (value: string) => void;
  experience: string;
  setExperience: (value: string) => void;
  onClose: () => void;
  onClear: () => void;
}) {
  const [expandedDropdown, setExpandedDropdown] = useState<"salary" | "experience" | null>(null);
  const toggle = (
    values: string[],
    value: string,
    setter: (next: string[]) => void,
  ) =>
    setter(
      values.includes(value)
        ? values.filter((item) => item !== value)
        : [...values, value],
    );

  return (
    <Stack spacing={1.25} className="th-filter-content">
      <Stack spacing={0.25} className="th-filter-group">
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          Work arrangement
        </Typography>
        {modes.map((item) => (
          <FormControlLabel
            key={item.value}
            control={
              <Checkbox
                size="small"
                checked={modesSelected.includes(item.value)}
                onChange={() =>
                  toggle(modesSelected, item.value, setModesSelected)
                }
              />
            }
            label={item.label}
          />
        ))}
      </Stack>
      <InlineFilterDropdown
        label="Salary range"
        value={salary}
        options={salaryOptions}
        onChange={setSalary}
        open={expandedDropdown === "salary"}
        onToggle={() => setExpandedDropdown((current) => current === "salary" ? null : "salary")}
      />
      <InlineFilterDropdown
        label="Experience level"
        value={experience}
        options={experienceOptions}
        onChange={setExperience}
        open={expandedDropdown === "experience"}
        onToggle={() => setExpandedDropdown((current) => current === "experience" ? null : "experience")}
      />
      <Stack direction="row" justifyContent="space-between" sx={{ pt: 0.5 }}>
        <Button variant="text" size="small" onClick={onClear}>
          Reset
        </Button>
        <Button variant="contained" size="small" onClick={onClose}>
          Done
        </Button>
      </Stack>
    </Stack>
  );
}
