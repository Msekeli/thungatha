export type JobFilterOption = { label: string; value: string };

export const PUBLISHED_WITHIN_OPTIONS: JobFilterOption[] = [
  { label: "Any time", value: "any" },
  { label: "Last 24 hours", value: "24h" },
  { label: "Last 7 days", value: "7d" },
  { label: "Last 14 days", value: "14d" },
  { label: "Last 30 days", value: "30d" },
];
