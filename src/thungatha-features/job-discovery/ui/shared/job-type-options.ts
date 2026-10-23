export const JOB_TYPE_OPTIONS = [
  { key: "all", label: "All opportunities", value: "" },
  { key: "full-time", label: "Full-time", value: "full_time" },
  { key: "part-time", label: "Part-time", value: "part_time" },
  { key: "contract", label: "Contract", value: "contract" },
  { key: "internship", label: "Internships", value: "internship" },
  { key: "learnership", label: "Learnerships", value: "learnership" },
  { key: "graduate", label: "Graduate programmes", value: "graduate" },
] as const;

export function employmentTypeForJobType(key: string): string {
  return JOB_TYPE_OPTIONS.find((item) => item.key === key)?.value ?? "";
}

export function jobTypeKeyForEmploymentType(value: string): string {
  const normalized = value.toLowerCase().replace(/[ -]+/g, "_");
  return (
    JOB_TYPE_OPTIONS.find((item) => item.value === normalized)?.key ?? "all"
  );
}
