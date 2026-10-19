"use client";

import { JobSearchBar } from "../shared/job-search-bar";
import { JobTypeChips, type JobTypeOption } from "../shared/job-type-chips";
import Stack from "@mui/material/Stack";

type Props = {
  query: string;
  onQueryChange: (value: string) => void;
  onSearch?: () => void;
  types?: JobTypeOption[];
  selectedType?: string;
  onTypeChange?: (value: string) => void;
};

export function PublicJobSearch({
  query, onQueryChange, onSearch, types = [], selectedType = "",
  onTypeChange,
}: Props) {
  return (
    <Stack spacing={2} className="w-full">
      <JobSearchBar value={query} onChange={onQueryChange} onSubmit={onSearch} />
      {types.length > 0 && onTypeChange && (
        <JobTypeChips options={types} value={selectedType} onChange={onTypeChange} />
      )}
    </Stack>
  );
}
