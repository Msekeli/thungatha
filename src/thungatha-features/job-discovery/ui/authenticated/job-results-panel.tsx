"use client";
import { Select } from "@base-ui/react/select";
import { ChevronDown, Check } from "lucide-react";
import { JobResultsState } from "./job-results-state";
import { JobResultsList } from "./job-results-list";
import type { JobResultsPanelProps } from "./job-results-types";

const sortOptions = [
  { value: "relevance", label: "Most relevant" },
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
];

export function AuthenticatedJobResultsPanel({
  jobs, feed, loading, error, hasFilters, mobileDetail, selectedId,
  loadMoreRef, sourceFor, formatDate, onRetry, onSelect, onSave, onDismiss,
  configured, resultCount, category, dismissedCount, isAuthenticated,
  sortOrder, onSortOrderChange, onCategoryChange,
}: JobResultsPanelProps) {
  return (
    <section
      className={`th-jobs-results-panel th-jobs-redesign-results flex h-full min-h-0 min-w-0 max-h-full flex-col overflow-hidden rounded-2xl border border-line bg-panel p-4 shadow-sm max-[900px]:max-h-[68dvh] max-[900px]:rounded-xl max-[900px]:p-3 max-[900px]:shadow-none max-[900px]:order-1 max-[700px]:h-full max-[700px]:max-h-none max-[700px]:rounded-none max-[700px]:border-0 max-[700px]:bg-transparent max-[700px]:p-0 ${mobileDetail ? "max-[900px]:hidden" : ""}`}
      aria-label="Job search results"
      aria-busy={loading}
    >
      <div className="mb-3 flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-[var(--th-line)] pb-3">
        <div className="flex items-center gap-3 text-sm text-[var(--th-fg-muted)]">
          <span aria-live="polite">{resultCount > 0 ? `1–${Math.min(30, resultCount)} of ${resultCount} opportunities` : "0 opportunities"}</span>
          {isAuthenticated && (
            <button type="button" onClick={() => onCategoryChange("dismissed", "Dismissed")} className={category === "dismissed" ? "font-semibold text-[var(--th-accent)] underline underline-offset-4" : "text-[var(--th-accent)] hover:underline"} aria-pressed={category === "dismissed"}>
              Dismissed ({dismissedCount})
            </button>
          )}
        </div>
        <Select.Root value={sortOrder} onValueChange={onSortOrderChange}>
          <Select.Trigger
            aria-label="Sort opportunities"
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-transparent px-2 text-sm text-[var(--th-fg)] outline-none hover:bg-[var(--th-line)]/40 focus-visible:ring-2 focus-visible:ring-[var(--th-accent)]/30"
          >
            <Select.Value />
            <Select.Icon className="inline-flex text-[var(--th-fg-muted)]">
              <ChevronDown size={16} aria-hidden="true" />
            </Select.Icon>
          </Select.Trigger>
          <Select.Portal>
            <Select.Positioner className="z-50 outline-none" sideOffset={6} align="end">
              <Select.Popup className="min-w-52 rounded-xl border border-[var(--th-line)] bg-[var(--th-panel)] p-1 text-sm text-[var(--th-fg)] shadow-lg outline-none">
                <Select.List>
                  {sortOptions.map((option) => (
                    <Select.Item key={option.value} value={option.value} className="flex cursor-default items-center justify-between gap-4 rounded-lg px-3 py-2 outline-none data-[highlighted]:bg-[var(--th-line)]/50">
                      <Select.ItemText>{option.label}</Select.ItemText>
                      <Select.ItemIndicator><Check size={14} aria-hidden="true" /></Select.ItemIndicator>
                    </Select.Item>
                  ))}
                </Select.List>
              </Select.Popup>
            </Select.Positioner>
          </Select.Portal>
        </Select.Root>
      </div>
      <div className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain [scrollbar-gutter:stable] [-webkit-overflow-scrolling:touch]">
        <JobResultsState loading={loading} hasFeed={Boolean(feed)} error={error} hasJobs={jobs.length > 0} hasFilters={hasFilters} onRetry={onRetry} />
        {jobs.length > 0 && <JobResultsList jobs={jobs} selectedId={selectedId} loading={loading} feed={feed} loadMoreRef={loadMoreRef} sourceFor={sourceFor} formatDate={formatDate} onSelect={onSelect} onSave={onSave} onDismiss={onDismiss} configured={configured} />}
      </div>
    </section>
  );
}
