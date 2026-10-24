import type { ReactNode } from "react";
import { JobDiscoveryDialogs } from "../authenticated/job-discovery-dialogs";
import { JobDiscoveryWorkspace } from "./job-discovery-workspace";
import { JobDiscoverySearchToolbar } from "./job-discovery-search-toolbar";
import { useJobDiscoveryDialogAnchors } from "../hooks/use-job-discovery-dialog-anchors";
import { useJobDiscoveryState } from "../hooks/use-job-discovery-state";
import { useJobDiscoveryController } from "../hooks/use-job-discovery-controller";
import { shown, sourceFor } from "../job-discovery-utils";

type State = ReturnType<typeof useJobDiscoveryState>;
type Controller = ReturnType<typeof useJobDiscoveryController>;

export function JobDiscoveryScreen({ configured, state, controller, routerPushProfile, workspaceLeadingColumn }: {
  configured: boolean; state: State; controller: Controller; routerPushProfile: () => void; workspaceLeadingColumn?: ReactNode;
}) {
  const s = state;
  const c = controller;
  useJobDiscoveryDialogAnchors(s, c.showApplicationPrompt);
  const category = s.category === "dismissed" || s.category === "saved" ? s.category : s.filters.employmentType || "all";
  const dismissedCount = s.dismissedCount;

  return (
    <>
      <JobDiscoverySearchToolbar state={s} controller={c} hasLeadingColumn={Boolean(workspaceLeadingColumn)} />
      <div className="min-h-0 flex-1 max-[900px]:mx-auto max-[900px]:w-[94%] max-[900px]:max-w-none max-[700px]:flex max-[700px]:flex-col">
        <JobDiscoveryWorkspace
          jobs={c.visibleJobs} feed={s.feed} loading={s.loading} error={s.error} hasFilters={c.hasFilters}
          mobileDetail={s.mobileDetail} selectedId={s.selectedId} loadMoreRef={s.loadMoreRef}
          selectedDetail={c.selectedDetail} selectedSource={c.selectedSource}
          applicationDestination={c.applicationDestination} applicationUrl={c.applicationUrl} jobSourceUrl={c.jobSourceUrl}
          busy={s.stateBusy} detailLoading={s.detailLoading} activityError={s.activityError} detailError={s.detailError}
          sourceFor={sourceFor} formatDate={c.formatDate} onRetryFeed={c.workspaceActions.retryFeed}
          onSaveJob={c.workspaceActions.saveJob} onDismissJob={c.workspaceActions.dismissJob}
          onSelect={c.workspaceActions.selectJob} onBack={c.workspaceActions.showResults}
          onViewMatch={c.workspaceActions.viewMatch} onApply={c.workspaceActions.applySelectedJob}
          onSave={c.workspaceActions.saveSelectedJob} onDismiss={c.workspaceActions.dismissSelectedJob}
          onRetryDetail={c.workspaceActions.retryDetail} configured={configured} leadingColumn={workspaceLeadingColumn}
          resultCount={s.feed?.total ?? 0} category={category} dismissedCount={dismissedCount}
          isAuthenticated={s.isAuthenticated} sortOrder={s.sortOrder} onSortOrderChange={s.setSortOrder}
          onCategoryChange={c.changeCategory}
        />
      </div>
      <JobDiscoveryDialogs
        filtersOpen={s.filtersOpen} filterAnchorEl={s.filterAnchorEl} draft={s.draft}
        changeDraft={c.changeDraft} clearFilters={c.clearFilters} applyFilters={c.applyFilters}
        setFiltersOpen={s.setFiltersOpen} profileSetupPrompt={s.profileSetupPrompt}
        setProfileSetupPrompt={s.setProfileSetupPrompt} profileSetupAnchorEl={s.profileSetupAnchorEl}
        setProfileSetupAnchorEl={s.setProfileSetupAnchorEl} routerPushProfile={routerPushProfile}
        matchOpen={s.matchOpen} setMatchOpen={s.setMatchOpen} matchAnchorEl={s.matchAnchorEl}
        applicationPromptAnchorEl={s.applicationPromptAnchorEl} showApplicationPrompt={c.showApplicationPrompt}
        stateBusy={s.stateBusy} jobTitle={c.selectedDetail?.title ?? ""}
        employer={shown(c.selectedDetail?.employer_name)} onCloseApplicationPrompt={c.workspaceActions.dismissAppliedPrompt}
        onConfirmApplied={() => void c.confirmApplied()}
      />
    </>
  );
}
