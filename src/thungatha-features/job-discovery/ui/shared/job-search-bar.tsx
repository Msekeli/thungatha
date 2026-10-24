"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Search, X } from "lucide-react";

type JobSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
  placeholder?: string;
};

const RECENT_SEARCHES_KEY = "thungatha-recent-job-searches";
const MAX_RECENT_SEARCHES = 5;

export function JobSearchBar({
  value,
  onChange,
  onSubmit,
  placeholder = "Job title, skill, or company",
}: JobSearchBarProps) {
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setRecentSearches(
            parsed
              .filter((item): item is string => typeof item === "string")
              .slice(0, MAX_RECENT_SEARCHES),
          );
        }
      }
    } catch {
      // Search history is optional; continue if browser storage is unavailable.
    }
  }, []);

  function rememberSearch(search: string) {
    const trimmed = search.trim();
    if (!trimmed) return;
    const next = [
      trimmed,
      ...recentSearches.filter(
        (item) => item.toLowerCase() !== trimmed.toLowerCase(),
      ),
    ].slice(0, MAX_RECENT_SEARCHES);
    setRecentSearches(next);
    try {
      window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
    } catch {
      // Search history is optional; continue if browser storage is unavailable.
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    rememberSearch(value);
    onSubmit?.(event);
  }

  return (
    <div className="w-full min-w-0">
      <form className="w-full" role="search" onSubmit={handleSubmit}>
        <label className="flex h-11 min-w-0 items-center gap-3 rounded-xl border border-[var(--th-line)] bg-[var(--th-panel)] px-3 text-[var(--th-fg-muted)] transition-colors focus-within:border-[var(--th-accent)] focus-within:ring-2 focus-within:ring-[var(--th-accent)]/15">
          <Search size={18} aria-hidden="true" />
          <input
            aria-label="Search roles, skills, or companies"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            autoComplete="off"
            className="h-full min-w-0 flex-1 bg-transparent text-sm text-[var(--th-fg)] outline-none placeholder:text-[var(--th-fg-muted)]"
          />
        </label>
      </form>
      {!value.trim() && recentSearches.length > 0 && (
        <div
          className="mt-2 flex min-w-0 flex-wrap items-center gap-2"
          aria-label="Recent searches"
        >
          <span className="text-xs text-[var(--th-fg-muted)]">Recent:</span>
          {recentSearches.map((search) => (
            <button
              key={search}
              type="button"
              onClick={() => onChange(search)}
              className="max-w-full truncate rounded-full border border-[var(--th-line)] bg-[var(--th-panel)] px-3 py-1 text-xs text-[var(--th-fg-muted)] transition-colors hover:border-[var(--th-accent)] hover:text-[var(--th-fg)]"
              title={`Use search: ${search}`}
            >
              {search}
            </button>
          ))}
          <button
            type="button"
            aria-label="Clear recent searches"
            title="Clear recent searches"
            onClick={() => {
              setRecentSearches([]);
              try {
                window.localStorage.removeItem(RECENT_SEARCHES_KEY);
              } catch {
                /* optional storage */
              }
            }}
            className="inline-flex size-6 items-center justify-center rounded-full text-[var(--th-fg-muted)] hover:bg-[var(--th-panel-2)] hover:text-[var(--th-fg)]"
          >
            <X size={13} aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
