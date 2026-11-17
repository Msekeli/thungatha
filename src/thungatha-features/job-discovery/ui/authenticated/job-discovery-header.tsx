"use client";

import { JobSearchBar } from "../shared/job-search-bar";
import { JobLocationSelect } from "../shared/job-location-select";
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
    <header
      className={`mx-auto w-full ${prominent ? "max-w-none pt-1" : "max-w-5xl"}`}
    >
      <div className="mx-auto flex w-full max-w-5xl flex-row items-center gap-2 max-[700px]:flex-col">
        <div className="min-w-0 flex-1 max-[700px]:w-full">
          <JobSearchBar
            prominent={prominent}
            value={draft.query}
            onChange={onQueryChange}
            onSubmit={onSubmit}
            isAuthenticated={isSignedIn}
            placeholder="Job title, skills, or company"
          />
        </div>
        <div className="w-[202px] shrink-0 max-[700px]:w-full">
          <JobLocationSelect
            value={draft.location}
            onChange={onLocationChange}
            ariaLabel="Filter jobs by location"
          />
        </div>
      </div>
    </header>
  );
}
