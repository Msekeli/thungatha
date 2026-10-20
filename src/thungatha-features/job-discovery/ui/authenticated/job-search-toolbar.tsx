"use client";

import type { FormEvent } from "react";
import {
  Box,
  Button,
  Stack,
} from "@mui/material";
import { SlidersHorizontal } from "lucide-react";
import { JobSearchBar } from "../shared/job-search-bar";
import { JobLocationSelect } from "../shared/job-discovery-controls";

type Props = {
  query: string;
  location: string;
  filtersOpen: boolean;
  onQueryChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onToggleFilters: (anchorEl: HTMLElement) => void;
};

export function AuthenticatedJobSearchToolbar({
  query,
  location,
  filtersOpen,
  onQueryChange,
  onLocationChange,
  onSubmit,
  onToggleFilters,
}: Props) {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={1}
      sx={{ width: "100%", alignItems: { sm: "center" } }}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <JobSearchBar
          value={query}
          onChange={onQueryChange}
          placeholder="Search roles, skills, or companies..."
          onSubmit={onSubmit}
        />
      </Box>
      <Box sx={{ minWidth: { xs: "100%", sm: 220 }, flex: { sm: "0 0 220px" } }}><JobLocationSelect value={location} onChange={onLocationChange} emptyMeansDefault /></Box>
      <Button
        type="button"
        size="small"
        variant="outlined"
        onClick={(event) => onToggleFilters(event.currentTarget)}
        aria-expanded={filtersOpen}
        startIcon={<SlidersHorizontal size={15} />}
        sx={{ height: 40, minWidth: 92, px: 1.5, whiteSpace: "nowrap" }}
      >
        Filters
      </Button>
    </Stack>
  );
}
