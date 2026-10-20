import Box from "@mui/material/Box";
import { PublicJobDiscoveryResultsToolbar } from "./public-job-discovery-results-toolbar";
import { PublicJobDiscoveryFeedContent } from "./public-job-discovery-feed-content";
import type { PublicJobDiscoveryResultsProps } from "./public-job-discovery-results-props";

export function PublicJobDiscoveryResults(
  props: PublicJobDiscoveryResultsProps,
) {
  const {
    jobs,
    visibleJobs,
    configured,
    loading,
    error,
    total,
    dismissedCount,
    showingDismissed,
    selectedId,
    hasActiveFilters,
    sort,
    query,
    promoVisible,
    dateLabel,
    sourceFor,
    onToggleDismissed,
    onClearFilters,
    onSortChange,
    onQueryChange,
    onOpenFilters,
    onRetry,
    onDismiss,
    onRestore,
    onSelect,
    onPromoDismiss,
  } = props;
  const visibleTotal = showingDismissed ? dismissedCount : total;
  return (
    <Box
      component="section"
      className="th-discovery-results"
      id="jobs"
      aria-label="Job results"
      sx={{ minWidth: 0, boxSizing: "border-box" }}
    >
      <PublicJobDiscoveryResultsToolbar
        loading={loading && !showingDismissed}
        resultCount={visibleJobs.length}
        total={visibleTotal}
        hasActiveFilters={hasActiveFilters}
        dismissedCount={dismissedCount}
        showingDismissed={showingDismissed}
        onToggleDismissed={onToggleDismissed}
        onClearFilters={onClearFilters}
        sort={sort}
        onSortChange={onSortChange}
        query={query}
        onQueryChange={onQueryChange}
        jobs={jobs}
        onOpenFilters={onOpenFilters}
      />
      <PublicJobDiscoveryFeedContent
        visibleJobs={visibleJobs}
        loading={loading}
        error={error}
        showingDismissed={showingDismissed}
        selectedId={selectedId}
        configured={configured}
        promoVisible={promoVisible}
        dateLabel={dateLabel}
        sourceFor={sourceFor}
        onRetry={onRetry}
        onDismiss={onDismiss}
        onRestore={onRestore}
        onSelect={onSelect}
        onPromoDismiss={onPromoDismiss}
      />
    </Box>
  );
}
