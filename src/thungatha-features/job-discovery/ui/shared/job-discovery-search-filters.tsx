"use client";

import type { FormEvent } from "react";
import { JobSearchBar } from "./job-search-bar";
import { JobLocationSelect } from "./job-location-select";

type Props = {
  prominent?: boolean;
  query: string;
  location: string;
  onQueryChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
  isAuthenticated: boolean;
};

export function JobDiscoverySearchFilters(props: Props) {
  return (
    <header className={`mx-auto w-full ${props.prominent ? "max-w-none pt-1" : "max-w-5xl"}`}>
      <div className="mx-auto flex w-full max-w-5xl flex-row items-center gap-2 max-[700px]:flex-col">
        <div className="min-w-0 flex-1 max-[700px]:w-full">
          <JobSearchBar
            prominent={props.prominent}
            value={props.query}
            onChange={props.onQueryChange}
            onSubmit={props.onSubmit}
            isAuthenticated={props.isAuthenticated}
            placeholder="Job title, skills, or company"
          />
        </div>
        <div className="w-[202px] shrink-0 max-[700px]:w-full">
          <JobLocationSelect
            value={props.location}
            onChange={props.onLocationChange}
            ariaLabel="Filter jobs by location"
          />
        </div>
      </div>
    </header>
  );
}
