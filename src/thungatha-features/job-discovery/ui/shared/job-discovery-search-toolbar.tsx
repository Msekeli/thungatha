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
      className={`w-full min-w-0 ${hasLeadingColumn ? "mx-auto mb-4 max-w-6xl" : ""} ${s.mobileDetail ? "max-[900px]:hidden" : ""} max-[900px]:mx-auto max-[900px]:mb-0 max-[900px]:w-[94%] max-[900px]:max-w-none`}
    >
      <JobDiscoveryControls
        isAuthenticated={s.isAuthenticated}
        draft={s.draft}
        filtersOpen={s.filtersOpen}
        categories={c.categories}
        category={s.category === "dismissed" || s.category === "saved" ? s.category : s.filters.employmentType || s.category}
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
