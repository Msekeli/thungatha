import { JobDiscoveryControls } from "../authenticated/job-discovery-controls";
import type { useJobDiscoveryState } from "../hooks/use-job-discovery-state";
import type { useJobDiscoveryController } from "../hooks/use-job-discovery-controller";

type Props = {
  state: ReturnType<typeof useJobDiscoveryState>;
  controller: ReturnType<typeof useJobDiscoveryController>;
  hasLeadingColumn: boolean;
};

export function JobDiscoverySearchToolbar({
  state,
  controller,
  hasLeadingColumn,
}: Props) {
  const s = state;
  const c = controller;
  return (
    <div
      className={`w-full min-w-0 ${hasLeadingColumn ? "mb-0 bg-gradient-to-r from-public-hero-from to-public-hero-to px-8 py-3 text-center text-public-hero-text max-[700px]:px-4 max-[700px]:py-4" : ""} ${s.mobileDetail ? "max-[900px]:hidden" : ""} max-[900px]:mx-auto max-[900px]:mb-4 max-[900px]:w-full max-[900px]:max-w-none ${s.isAuthenticated ? "max-[900px]:w-[94%]" : ""}`}
    >
      {hasLeadingColumn && (
        <div className="mx-auto mb-1 max-w-4xl">
          <h1 className="text-2xl font-bold tracking-tight max-[700px]:text-xl">
            Find your next{" "}
            <span className="text-accent-on-navy">opportunity</span>
          </h1>
          <p className="mx-auto mt-1 max-w-3xl text-control leading-relaxed text-public-hero-muted max-[700px]:text-xs">
            Explore thousands of jobs in South Africa. Create an account to
            tailor your CV, save jobs and track your applications.
          </p>
        </div>
      )}
      <JobDiscoveryControls
        prominent={hasLeadingColumn}
        isAuthenticated={s.isAuthenticated}
        draft={s.draft}
        filtersOpen={s.filtersOpen}
        categories={c.categories}
        category={
          s.category === "dismissed" || s.category === "saved"
            ? s.category
            : s.filters.employmentType || "all"
        }
        resultCount={s.feed?.total ?? 0}
        sortOrder={s.sortOrder}
        onSortOrderChange={s.setSortOrder}
        onQueryChange={(value) => c.changeDraft("query", value)}
        onLocationChange={(value) => c.changeDraft("location", value)}
        onSubmit={c.submitFilters}
        onToggleFilters={(anchorEl) => {
          s.setFilterAnchorEl(anchorEl);
          s.setFiltersOpen((value) => !value);
        }}
        onCategoryChange={c.changeCategory}
        undoAction={s.undoAction}
        stateBusy={s.stateBusy}
        onUndo={() => void c.undoLastStateChange()}
        onDismissUndo={() => s.setUndoAction(null)}
        stateMessage={s.stateMessage}
        onDismissMessage={() => s.setStateMessage(null)}
        stateError={s.stateError}
        onDismissError={() => s.setStateError(null)}
      />
    </div>
  );
}
