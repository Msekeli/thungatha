"use client";

import { JobFilters, type JobFilterField } from "../shared/job-filters";
import { JobSearchBar } from "../shared/job-search-bar";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";

type Props = {
  query: string;
  onQueryChange: (value: string) => void;
  fields: JobFilterField[];
  onReset: () => void;
};

export function JobFeedFilters({ query, onQueryChange, fields, onReset }: Props) {
  return (
    <Stack spacing={2} className="w-full">
      <JobSearchBar value={query} onChange={onQueryChange} />
      <JobFilters fields={fields} />
      <Button variant="text" onClick={onReset} className="self-start">Reset filters</Button>
    </Stack>
  );
}
