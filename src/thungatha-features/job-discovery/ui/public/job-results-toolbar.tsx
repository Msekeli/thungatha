import { X } from "lucide-react";

export type JobSortOption = {
  value: string;
  label: string;
};

type JobResultsToolbarProps = {
  className: string;
  summary: string;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  sortValue: string;
  onSortChange: (value: string) => void;
  sortOptions: JobSortOption[];
  sortLabel?: string;
};

export function JobResultsToolbar({
  className,
  summary,
  hasActiveFilters,
  onClearFilters,
  sortValue,
  onSortChange,
  sortOptions,
  sortLabel = "Sort by",
}: JobResultsToolbarProps) {
  return (
    <div className={className}>
      <span>{summary}</span>
      {hasActiveFilters && (
        <button
          type="button"
          className="th-clear-active-filters"
          onClick={onClearFilters}
        >
          <X size={13} aria-hidden="true" /> Clear filters
        </button>
      )}
      <label>
        {sortLabel}{" "}
        <select
          value={sortValue}
          onChange={(event) => onSortChange(event.target.value)}
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
