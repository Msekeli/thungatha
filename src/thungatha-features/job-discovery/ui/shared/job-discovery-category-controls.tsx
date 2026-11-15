"use client";

import { JobCategoryChips } from "./job-category-chips";

export function JobDiscoveryCategoryControls({
  prominent = false,
  selectedType,
  onTypeChange,
}: {
  prominent?: boolean;
  selectedType: string;
  onTypeChange: (key: string, label: string) => void;
}) {
  return (
    <div className={`${prominent ? "" : "mt-3"} min-w-0 pb-1`}>
      <div className="min-w-0 overflow-x-auto">
        <JobCategoryChips
          prominent={prominent}
          activeKey={selectedType}
          className="min-w-max flex-nowrap"
          onSelect={onTypeChange}
        />
      </div>
    </div>
  );
}
