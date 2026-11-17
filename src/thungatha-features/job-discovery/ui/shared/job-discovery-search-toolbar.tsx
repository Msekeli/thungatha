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
      className={`w-full min-w-0 ${hasLeadingColumn ? "mb-0 bg-gradient-to-r from-public-hero-from to-public-hero-to px-8 py-2 text-center text-public-hero-text max-[700px]:relative max-[700px]:left-1/2 max-[700px]:mb-2 max-[700px]:!w-screen max-[700px]:-translate-x-1/2 max-[700px]:px-4 max-[700px]:py-3" : ""} ${s.mobileDetail ? "max-[900px]:hidden" : ""} max-[900px]:mx-auto max-[900px]:mb-2 max-[900px]:max-w-none ${s.isAuthenticated ? "max-[900px]:w-[94%]" : "max-[900px]:w-full"}`}
    >
      {hasLeadingColumn && (
        <div className="mx-auto mb-1 max-w-4xl">
          <h1 className="text-xl font-bold tracking-tight max-[700px]:text-lg">
            Find your next{" "}
            <span className="text-accent-on-navy">opportunity</span>
          </h1>
          <p className="mx-auto mt-0.5 max-w-3xl text-xs leading-relaxed text-public-hero-muted">
            Explore opportunities from verified employer sources.
          </p>
        </div>
      )}
      <JobDiscoveryControls
        prominent={hasLeadingColumn}
        isAuthenticated={s.isAuthenticated}
        isSignedIn={s.userSignedIn}
        draft={s.draft}
        onQueryChange={(value) => c.changeDraft("query", value)}
        onLocationChange={(value) => c.changeDraft("location", value)}
        onSubmit={c.submitFilters}
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
