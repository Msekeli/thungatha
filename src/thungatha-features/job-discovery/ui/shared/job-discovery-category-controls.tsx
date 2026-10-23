"use client";

import { JobCategoryChips } from "./job-category-chips";

const typeKeyByValue: Record<string, string> = {
  all: "all",
  full_time: "full-time",
  part_time: "part-time",
  contract: "contract",
  internship: "internship",
  learnership: "learnership",
  graduate: "graduate",
};

export function JobDiscoveryCategoryControls({
  selectedType,
  total,
  sortOrder,
  onTypeChange,
  onSortChange,
}: {
  selectedType: string;
  total: number;
  sortOrder: string;
  onTypeChange: (key: string, label: string) => void;
  onSortChange: (value: string) => void;
}) {
  return (
    <div className="mt-3 flex min-w-0 items-center gap-3 pb-1">
      <div className="min-w-0 flex-1 overflow-x-auto">
        <JobCategoryChips
          activeKey={typeKeyByValue[selectedType] ?? selectedType ?? "all"}
          counts={{ all: total }}
          showAllCount
          className="min-w-max flex-nowrap"
          onSelect={onTypeChange}
        />
      </div>
      <select
        aria-label="Sort opportunities"
        value={sortOrder}
        onChange={(event) => onSortChange(event.target.value)}
        className="h-9 w-36 shrink-0 rounded-full border border-[var(--th-line)] bg-[var(--th-panel)] px-3 text-sm text-[var(--th-fg)] outline-none focus-visible:border-[var(--th-accent)]"
      >
        <option value="newest">Sort: Newest</option>
        <option value="oldest">Sort: Oldest</option>
      </select>
    </div>
  );
}
