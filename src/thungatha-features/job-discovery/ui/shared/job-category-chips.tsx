"use client";

import { JOB_TYPE_OPTIONS } from "./job-type-options";

type Props = {
  activeKey: string;
  counts?: Record<string, number | null>;
  showAllCount?: boolean;
  className?: string;
  onSelect: (key: string, label: string) => void;
};

export function JobCategoryChips({
  activeKey,
  counts = {},
  showAllCount,
  className = "",
  onSelect,
}: Props) {
  return (
    <div
      role="group"
      aria-label="Opportunity categories"
      className={`flex flex-wrap items-center gap-2 ${className}`}
    >
      {JOB_TYPE_OPTIONS.map((item) => {
        const active = activeKey === item.key;
        const count = counts[item.key];
        const label =
          showAllCount && item.key === "all" && count != null
            ? `${item.label} · ${count}`
            : item.label;
        return (
          <button
            key={item.key}
            type="button"
            aria-pressed={active}
            onClick={() => onSelect(item.key, item.label)}
            className={`h-9 whitespace-nowrap rounded-full border px-4 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--th-accent)] ${active ? "border-transparent bg-[var(--th-accent-bg)] text-[var(--th-accent-text)]" : "border-[var(--th-line)] text-[var(--th-fg)] hover:bg-[var(--th-panel-2)]"}`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
