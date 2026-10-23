"use client";

import type { FormEvent } from "react";
import { Search } from "lucide-react";

type JobSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
  placeholder?: string;
  suggestions?: string[];
};

export function JobSearchBar({
  value,
  onChange,
  onSubmit,
  placeholder = "Job title, skill, or company",
  suggestions = [],
}: JobSearchBarProps) {
  const options = [
    ...new Set(suggestions.map((item) => item.trim()).filter(Boolean)),
  ];
  return (
    <form
      className="w-full"
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit?.(event);
      }}
    >
      <label className="flex h-11 min-w-0 items-center gap-3 rounded-xl border border-[var(--th-line)] bg-[var(--th-panel)] px-3 text-[var(--th-fg-muted)] focus-within:border-[var(--th-accent)]">
        <Search size={18} aria-hidden="true" />
        <input
          aria-label="Search roles, skills, or companies"
          list={options.length ? "job-search-suggestions" : undefined}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="h-full min-w-0 flex-1 bg-transparent text-sm text-[var(--th-fg)] outline-none placeholder:text-[var(--th-fg-muted)]"
        />
        {options.length > 0 && (
          <datalist id="job-search-suggestions">
            {options.map((option) => <option key={option} value={option} />)}
          </datalist>
        )}
      </label>
    </form>
  );
}
