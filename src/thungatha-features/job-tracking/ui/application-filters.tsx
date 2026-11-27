"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";

const filters = [
  "All",
  "Draft",
  "Submitted",
  "Under review",
  "Interview",
  "Offer",
  "Accepted",
  "Rejected",
  "Withdrawn",
];

type Props = {
  selected: string;
  onSelect: (value: string) => void;
  query: string;
  onQueryChange: (value: string) => void;
};

export function ApplicationFilters({
  selected,
  onSelect,
  query,
  onQueryChange,
}: Props) {
  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-sm">
          <Search
            aria-hidden="true"
            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            aria-label="Search applications"
            placeholder="Search company or job title"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <SlidersHorizontal aria-hidden="true" className="size-4" />
          Filter applications by status
        </div>
      </div>
      <div
        className="flex gap-2 overflow-x-auto pb-1"
        aria-label="Application status filters"
      >
        {filters.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => onSelect(filter)}
            aria-pressed={selected === filter}
            className="shrink-0 rounded-full border border-border bg-card px-3.5 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground"
          >
            {filter}
          </button>
        ))}
      </div>
    </section>
  );
}
