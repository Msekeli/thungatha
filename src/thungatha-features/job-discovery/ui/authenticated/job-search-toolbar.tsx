"use client";

import { MapPin, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JobSearchBar } from "../shared/job-search-bar";

type Props = {
  query: string; location: string; filtersOpen: boolean;
  onQueryChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onSubmit: () => void; onToggleFilters: () => void;
};

export function AuthenticatedJobSearchToolbar({
  query, location, filtersOpen, onQueryChange, onLocationChange,
  onSubmit, onToggleFilters,
}: Props) {
  return (
    <div className="th-jobs-toolbar">
      <JobSearchBar value={query} onChange={onQueryChange}
        placeholder="Search roles, skills, or companies..." onSubmit={onSubmit} />
      <label className="th-jobs-location-select">
        <MapPin aria-hidden="true" size={17} strokeWidth={1.7} />
        <select aria-label="Location" value={location} onChange={(event) => onLocationChange(event.target.value)}>
          <option value="">Cape Town + 50 km</option>
          <option value="Cape Town">Cape Town</option>
          <option value="Stellenbosch">Stellenbosch</option>
          <option value="Western Cape">Western Cape</option>
        </select>
      </label>
      <Button type="button" variant="secondary" onClick={onToggleFilters} aria-expanded={filtersOpen}>
        <SlidersHorizontal size={15} /> Filters
      </Button>
    </div>
  );
}
