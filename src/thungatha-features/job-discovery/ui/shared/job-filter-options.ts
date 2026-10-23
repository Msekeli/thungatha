export type JobFilterOption = { label: string; value: string };

export const EMPLOYMENT_TYPE_OPTIONS: JobFilterOption[] = [
  { label: "All opportunity types", value: "all" },
  { label: "Full-time", value: "full_time" },
  { label: "Part-time", value: "part_time" },
  { label: "Contract", value: "contract" },
  { label: "Internships", value: "internship" },
  { label: "Learnerships", value: "learnership" },
  { label: "Graduate programmes", value: "graduate" },
];

export const WORK_MODE_OPTIONS: JobFilterOption[] = [
  { label: "Remote", value: "remote" },
  { label: "Hybrid", value: "hybrid" },
  { label: "On-site", value: "onsite" },
];

export const PUBLISHED_WITHIN_OPTIONS: JobFilterOption[] = [
  { label: "Last 24 hours", value: "24h" },
  { label: "Last 7 days", value: "7d" },
  { label: "Last 14 days", value: "14d" },
  { label: "Last 30 days", value: "30d" },
];

export const EXPERIENCE_OPTIONS: JobFilterOption[] = [
  { label: "Any level", value: "any" },
  { label: "Entry level", value: "entry" },
  { label: "Mid-level", value: "mid" },
  { label: "Senior", value: "senior" },
];
