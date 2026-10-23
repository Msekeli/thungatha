"use client";

export type JobDetailTab = { label: string; value: string };
type JobDetailTabsProps = {
  tabs?: JobDetailTab[];
  value: string;
  onChange: (value: string) => void;
};

const DEFAULT_TABS: JobDetailTab[] = [
  { label: "Job description", value: "description" },
  { label: "Requirements", value: "requirements" },
  { label: "Benefits", value: "benefits" },
  { label: "About the company", value: "company" },
];

export function JobDetailTabs({
  tabs = DEFAULT_TABS,
  value,
  onChange,
}: JobDetailTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Job details sections"
      className="flex min-w-0 overflow-x-auto border-b border-line"
    >
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          role="tab"
          aria-selected={value === tab.value}
          className="min-h-12 shrink-0 border-b-2 border-transparent px-4 text-sm text-fg-muted hover:text-fg aria-selected:border-accent aria-selected:text-accent"
          onClick={() => onChange(tab.value)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
