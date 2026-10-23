"use client";
import Box from "@mui/material/Box";
import { JobResultsHeading } from "./job-results-heading";
import { JobResultsState } from "./job-results-state";
import { JobResultsList } from "./job-results-list";
import type { JobResultsPanelProps } from "./job-results-types";
export function AuthenticatedJobResultsPanel({
  jobs,
  feed,
  loading,
  error,
  hasFilters,
  mobileDetail,
  selectedId,
  loadMoreRef,
  sourceFor,
  formatDate,
  onRetry,
  onSelect,
  onSave,
  onDismiss,
  configured,
  sortOrder,
  onSortChange,
}: JobResultsPanelProps) {
  return (
    <Box
      component="section"
      className={`th-jobs-results-panel th-jobs-redesign-results ${mobileDetail ? "th-jobs-mobile-hidden" : ""}`}
      aria-label="Job search results"
      aria-busy={loading}
      sx={{
        minWidth: 0,
        minHeight: 0,
        maxHeight: "100%",
        overflowX: "hidden",
        overflowY: "auto",
        overscrollBehaviorY: "contain",
        WebkitOverflowScrolling: "touch",
        p: 1.75,
        border: 1,
        borderColor: "divider",
        borderRadius: 2,
        bgcolor: "background.paper",
        boxShadow: 1,
        "& .th-jobs-results-head": {
          position: "sticky",
          top: 0,
          zIndex: 3,
          mx: -0.25,
          mt: -0.25,
          mb: 1.5,
          px: 0.5,
          py: 1,
          borderBottom: 1,
          borderColor: "divider",
          bgcolor: "background.paper",
        },
        "@media (max-width: 760px)": {
          p: 1.25,
          borderRadius: 1.75,
          boxShadow: "none",
          "& .th-jobs-results-head": {
            position: "sticky",
            top: 0,
            mx: 0,
            mt: 0,
            mb: 1.25,
            px: 0.25,
            py: 0.75,
          },
        },
      }}
    >
      <JobResultsHeading
        loading={loading}
        count={jobs.length}
        total={feed?.total ?? jobs.length}
        sortOrder={sortOrder}
        onSortChange={onSortChange}
      />
      <JobResultsState
        loading={loading}
        hasFeed={Boolean(feed)}
        error={error}
        hasJobs={jobs.length > 0}
        hasFilters={hasFilters}
        onRetry={onRetry}
      />
      {jobs.length > 0 && (
        <JobResultsList
          jobs={jobs}
          selectedId={selectedId}
          loading={loading}
          feed={feed}
          loadMoreRef={loadMoreRef}
          sourceFor={sourceFor}
          formatDate={formatDate}
          onSelect={onSelect}
          onSave={onSave}
          onDismiss={onDismiss}
          configured={configured}
        />
      )}
    </Box>
  );
}
