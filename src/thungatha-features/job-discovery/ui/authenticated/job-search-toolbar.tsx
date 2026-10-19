"use client";

import { Box, Button, FormControl, MenuItem, Select, Stack } from "@mui/material";
import { MapPin, SlidersHorizontal } from "lucide-react";
import { JobSearchBar } from "../shared/job-search-bar";

type Props = {
  query: string;
  location: string;
  filtersOpen: boolean;
  onQueryChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onSubmit: () => void;
  onToggleFilters: () => void;
};

export function AuthenticatedJobSearchToolbar({
  query, location, filtersOpen, onQueryChange, onLocationChange,
  onSubmit, onToggleFilters,
}: Props) {
  return (
    <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ width: "100%" }}>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <JobSearchBar value={query} onChange={onQueryChange}
          placeholder="Search roles, skills, or companies..." onSubmit={onSubmit} />
      </Box>
      <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 185 } }}>
        <Select displayEmpty value={location} onChange={(event) => onLocationChange(event.target.value)}
          inputProps={{ "aria-label": "Location" }}
          startAdornment={<MapPin size={16} style={{ marginRight: 8 }} />}>
          <MenuItem value="">Cape Town + 50 km</MenuItem>
          <MenuItem value="Cape Town">Cape Town</MenuItem>
          <MenuItem value="Johannesburg">Johannesburg</MenuItem>
          <MenuItem value="Durban">Durban</MenuItem>
          <MenuItem value="Remote">Remote</MenuItem>
          <MenuItem value="Anywhere">Anywhere</MenuItem>
        </Select>
      </FormControl>
      <Button type="button" variant="outlined" onClick={onToggleFilters}
        aria-expanded={filtersOpen} startIcon={<SlidersHorizontal size={15} />}>
        Filters
      </Button>
    </Stack>
  );
}
