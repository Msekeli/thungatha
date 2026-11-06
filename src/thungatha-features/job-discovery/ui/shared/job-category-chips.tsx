"use client";

import { JOB_TYPE_OPTIONS } from "./job-type-options";

type Props = {
  activeKey: string;
  prominent?: boolean;
  prominent?: boolean;
  counts?: Record<string, number | null>;
  showAllCount?: boolean;
  className?: string;
  onSelect: (key: string, label: string) => void;
};

export function JobCategoryChips({
  activeKey,
  prominent = false,
  counts = {},
  showAllCount,
  className = "",
  onSelect,
}: Props) {
  return (
    <div
      role="group"
      aria-label="Opportunity categories"
      className={`flex flex-wrap items-center justify-center gap-2.5 ${className}`}
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
            className={`h-9 whitespace-nowrap rounded-full border px-4 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--th-accent)] ${prominent ? (active ? "border-btn bg-btn text-btn-fg" : "border-public-chip-border bg-public-chip-bg text-public-chip-text hover:brightness-110") : (active ? "border-transparent bg-[var(--th-accent-bg)] text-[var(--th-accent-text)]" : "border-[var(--th-line)] text-[var(--th-fg)] hover:bg-[var(--th-panel-2)]")}`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
