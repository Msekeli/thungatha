"use client";

import { useState } from "react";
import { Button, Checkbox, FormControlLabel, Stack, Typography } from "@mui/material";
import { ChevronDown, ChevronUp } from "lucide-react";

export const EMPLOYMENT_TYPE_OPTIONS = [
  { label: "All opportunity types", value: "all" },
  { label: "Full-time", value: "full_time" },
  { label: "Part-time", value: "part_time" },
  { label: "Contract", value: "contract" },
  { label: "Internships", value: "internship" },
  { label: "Learnerships", value: "learnership" },
  { label: "Graduate programmes", value: "graduate" },
];

export const WORK_MODE_OPTIONS = [
  { label: "Remote", value: "remote" },
  { label: "Hybrid", value: "hybrid" },
  { label: "On-site", value: "onsite" },
];

export const PUBLISHED_WITHIN_OPTIONS = [
  { label: "Last 24 hours", value: "24h" },
  { label: "Last 7 days", value: "7d" },
  { label: "Last 14 days", value: "14d" },
  { label: "Last 30 days", value: "30d" },
];


export const EXPERIENCE_OPTIONS = [
  { label: "Any level", value: "any" },
  { label: "Entry level", value: "entry" },
  { label: "Mid-level", value: "mid" },
  { label: "Senior", value: "senior" },
];

function InlineFilterDropdown({
  label, value, options, onChange, open, onToggle,
}: {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (value: string) => void;
  open: boolean;
  onToggle: () => void;
}) {
  const selected = options.find((option) => option.value === value) ?? options[0];
  return (
    <Stack spacing={0.5} className="th-filter-dropdown">
      <Button fullWidth variant="outlined" onClick={onToggle} aria-expanded={open}
        sx={{ justifyContent: "space-between", minHeight: 40, px: 1.25, textTransform: "none", borderColor: "var(--th-line)", color: "var(--th-fg)" }}>
        <Stack alignItems="flex-start" spacing={0} sx={{ minWidth: 0 }}>
          <Typography variant="caption" sx={{ color: "var(--th-fg-muted)" }}>{label}</Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>{selected.label}</Typography>
        </Stack>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </Button>
      {open && <Stack role="listbox" aria-label={label} spacing={0.25}
        sx={{ p: 0.5, border: "1px solid var(--th-line)", borderRadius: 1.5, bgcolor: "var(--th-panel)" }}>
        {options.map((option) => (
          <Button key={option.value} fullWidth role="option" aria-selected={value === option.value}
            variant="text" onClick={() => { onChange(option.value); onToggle(); }}
            sx={{ justifyContent: "flex-start", minHeight: 36, px: 1, textTransform: "none", color: "var(--th-fg)", bgcolor: value === option.value ? "var(--th-tag-bg)" : "transparent" }}>
            {option.label}
          </Button>
        ))}
      </Stack>}
    </Stack>
  );
}

type Props = {
  workMode: string | string[];
  onWorkModeChange: (value: string | string[]) => void;
  employmentType: string;
  onEmploymentTypeChange: (value: string) => void;
  publishedWithin?: string;
  onPublishedWithinChange?: (value: string) => void;
  experience?: string;
  onExperienceChange?: (value: string) => void;
};

export function JobFilterFields(props: Props) {
  const [expandedDropdown, setExpandedDropdown] = useState<string | null>(null);
  const toggle = (key: string) => setExpandedDropdown((current) => current === key ? null : key);
  const selectedModes = Array.isArray(props.workMode) ? props.workMode : props.workMode ? [props.workMode] : [];
  const multiMode = Array.isArray(props.workMode);

  return (
    <Stack spacing={1.25} className="th-filter-content">
      <Stack spacing={0.25} className="th-filter-group">
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Work arrangement</Typography>
        {WORK_MODE_OPTIONS.map((item) => (
          <FormControlLabel key={item.value}
            control={<Checkbox size="small" checked={selectedModes.includes(item.value)}
              onChange={() => {
                if (multiMode) {
                  const next = selectedModes.includes(item.value)
                    ? selectedModes.filter((mode) => mode !== item.value)
                    : [...selectedModes, item.value];
                  props.onWorkModeChange(next);
                } else {
                  props.onWorkModeChange(selectedModes.includes(item.value) ? "" : item.value);
                }
              }} />}
            label={item.label}
          />
        ))}
      </Stack>
      <InlineFilterDropdown label="Employment type" value={props.employmentType || "all"}
        options={EMPLOYMENT_TYPE_OPTIONS} onChange={props.onEmploymentTypeChange}
        open={expandedDropdown === "employmentType"} onToggle={() => toggle("employmentType")} />
      {props.publishedWithin !== undefined && props.onPublishedWithinChange && (
        <InlineFilterDropdown label="Posted within" value={props.publishedWithin}
          options={PUBLISHED_WITHIN_OPTIONS} onChange={props.onPublishedWithinChange}
          open={expandedDropdown === "publishedWithin"} onToggle={() => toggle("publishedWithin")} />
      )}
      {props.experience !== undefined && props.onExperienceChange && (
        <InlineFilterDropdown label="Experience level" value={props.experience}
          options={EXPERIENCE_OPTIONS} onChange={props.onExperienceChange}
          open={expandedDropdown === "experience"} onToggle={() => toggle("experience")} />
      )}
    </Stack>
  );
}
