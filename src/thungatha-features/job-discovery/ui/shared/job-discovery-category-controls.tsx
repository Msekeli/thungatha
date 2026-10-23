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
  onTypeChange,
}: {
  selectedType: string;
  total: number;
  onTypeChange: (key: string, label: string) => void;
}) {
  return (
    <div className="mt-3 min-w-0 pb-1">
      <div className="min-w-0 overflow-x-auto">
        <JobCategoryChips
          activeKey={typeKeyByValue[selectedType] ?? selectedType ?? "all"}
          counts={{ all: total }}
          showAllCount
          className="min-w-max flex-nowrap"
          onSelect={onTypeChange}
        />
      </div>
    </div>
  );
}
