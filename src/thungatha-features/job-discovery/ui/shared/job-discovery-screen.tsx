import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import { JobDiscoveryDialogs } from "../authenticated/job-discovery-dialogs";
import { JobDiscoveryControls } from "../authenticated/job-discovery-controls";
import { JobDiscoveryWorkspace } from "./job-discovery-workspace";
import { useJobDiscoveryDialogAnchors } from "../hooks/use-job-discovery-dialog-anchors";
import { useJobDiscoveryState } from "../hooks/use-job-discovery-state";
import { useJobDiscoveryController } from "../hooks/use-job-discovery-controller";
import { shown, sourceFor } from "../job-discovery-utils";

type State = ReturnType<typeof useJobDiscoveryState>;
type Controller = ReturnType<typeof useJobDiscoveryController>;

export function JobDiscoveryScreen({
  configured,
  state,
  controller,
  routerPushProfile,
  workspaceLeadingColumn,
}: {
  configured: boolean;
  state: State;
  controller: Controller;
  routerPushProfile: () => void;
  workspaceLeadingColumn?: ReactNode;
}) {
  const s = state;
  const c = controller;
  useJobDiscoveryDialogAnchors(s, c.showApplicationPrompt);

  return (
    <>
      <div className={workspaceLeadingColumn ? "mx-auto mb-4 w-full max-w-6xl" : undefined}>
        <JobDiscoveryControls
          isAuthenticated={s.isAuthenticated}
          draft={s.draft}
          filtersOpen={s.filtersOpen}
          categories={c.categories}
          category={s.filters.employmentType || s.category}
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
      <Box
        sx={{
          flex: workspaceLeadingColumn ? "1 1 auto" : undefined,
          minHeight: 0,
        }}
      >
        <JobDiscoveryWorkspace
          jobs={c.visibleJobs}
          feed={s.feed}
          loading={s.loading}
          error={s.error}
          hasFilters={c.hasFilters}
          mobileDetail={s.mobileDetail}
          selectedId={s.selectedId}
          loadMoreRef={s.loadMoreRef}
          selectedDetail={c.selectedDetail}
          selectedSource={c.selectedSource}
          applicationDestination={c.applicationDestination}
          applicationUrl={c.applicationUrl}
          jobSourceUrl={c.jobSourceUrl}
          busy={s.stateBusy}
          detailLoading={s.detailLoading}
          activityError={s.activityError}
          detailError={s.detailError}
          sourceFor={sourceFor}
          formatDate={c.formatDate}
          onRetryFeed={c.workspaceActions.retryFeed}
          onSaveJob={c.workspaceActions.saveJob}
          onDismissJob={c.workspaceActions.dismissJob}
          onSelect={c.workspaceActions.selectJob}
          onBack={c.workspaceActions.showResults}
          onViewMatch={c.workspaceActions.viewMatch}
          onApply={c.workspaceActions.applySelectedJob}
          onSave={c.workspaceActions.saveSelectedJob}
          onDismiss={c.workspaceActions.dismissSelectedJob}
          onRetryDetail={c.workspaceActions.retryDetail}
          configured={configured}
          sortOrder={s.sortOrder}
          onSortChange={s.setSortOrder}
          leadingColumn={workspaceLeadingColumn}
        />
      </Box>
      <JobDiscoveryDialogs
        filtersOpen={s.filtersOpen}
        filterAnchorEl={s.filterAnchorEl}
        draft={s.draft}
        changeDraft={c.changeDraft}
        clearFilters={c.clearFilters}
        applyFilters={c.applyFilters}
        setFiltersOpen={s.setFiltersOpen}
        profileSetupPrompt={s.profileSetupPrompt}
        setProfileSetupPrompt={s.setProfileSetupPrompt}
        profileSetupAnchorEl={s.profileSetupAnchorEl}
        setProfileSetupAnchorEl={s.setProfileSetupAnchorEl}
        routerPushProfile={routerPushProfile}
        matchOpen={s.matchOpen}
        setMatchOpen={s.setMatchOpen}
        matchAnchorEl={s.matchAnchorEl}
        applicationPromptAnchorEl={s.applicationPromptAnchorEl}
        showApplicationPrompt={c.showApplicationPrompt}
        stateBusy={s.stateBusy}
        jobTitle={c.selectedDetail?.title ?? ""}
        employer={shown(c.selectedDetail?.employer_name)}
        onCloseApplicationPrompt={c.workspaceActions.dismissAppliedPrompt}
        onConfirmApplied={() => void c.confirmApplied()}
      />
    </>
  );
}
