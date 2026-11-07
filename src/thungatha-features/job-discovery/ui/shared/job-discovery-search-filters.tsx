"use client";

import type { FormEvent } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JobSearchBar } from "./job-search-bar";
import { JobDiscoveryCategoryControls } from "./job-discovery-category-controls";

type Props = {
  prominent?: boolean;
  query: string;
  onQueryChange: (value: string) => void;
  onOpenFilters: (anchorEl: HTMLElement) => void;
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
  category: string;
  onCategoryChange: (key: string, label: string) => void;
  isAuthenticated: boolean;
};

export function JobDiscoverySearchFilters(props: Props) {
  return (
    <header
      className={`mx-auto w-full ${props.prominent ? "mb-0 max-w-none pt-3" : "mb-4 max-w-5xl"} max-[900px]:mx-0 max-[900px]:mb-3 max-[900px]:max-w-none max-[700px]:mt-4`}
    >
      <div className={`mx-auto flex w-full ${props.prominent ? "max-w-4xl" : "max-w-4xl"} flex-row items-center gap-2 max-[900px]:max-w-none`}>
        <div className="min-w-0 flex-1">
          <JobSearchBar
            prominent={props.prominent}
            value={props.query}
            onChange={props.onQueryChange}
            onSubmit={props.onSubmit}
            placeholder="Job title, skill, or company"
          />
        </div>
        <Button
          variant="primary"
          className="h-11 shrink-0 gap-2 rounded-xl border-0 bg-public-action-bg px-3 text-public-action-fg hover:brightness-110"
          aria-label="Open filters"
          onClick={(event) => props.onOpenFilters(event.currentTarget)}
        >
          <SlidersHorizontal size={16} aria-hidden="true" />
          <span>Filters</span>
        </Button>
      </div>
      <div className="mt-3 min-w-0">
        <JobDiscoveryCategoryControls
          prominent={props.prominent}
          selectedType={props.category}
          onTypeChange={props.onCategoryChange}
        />
      </div>
    </header>
  );
}
