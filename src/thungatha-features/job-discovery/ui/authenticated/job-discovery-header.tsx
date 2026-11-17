"use client";

import { JobDiscoverySearchFilters } from "../shared/job-discovery-search-filters";
import type { Filters } from "../job-discovery-utils";
import type { FormEvent } from "react";

export function JobDiscoveryHeader({
  prominent = false,
  draft,
  onQueryChange,
  onLocationChange,
  onSubmit,
  isSignedIn,
}: {
  prominent?: boolean;
  draft: Filters;
  onQueryChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  isSignedIn: boolean;
}) {
  return (
    <div className="w-full">
      <JobDiscoverySearchFilters
        prominent={prominent}
        query={draft.query}
        location={draft.location}
        onQueryChange={onQueryChange}
        onLocationChange={onLocationChange}
        onSubmit={onSubmit}
        isAuthenticated={isSignedIn}
      />
    </div>
  );
}
