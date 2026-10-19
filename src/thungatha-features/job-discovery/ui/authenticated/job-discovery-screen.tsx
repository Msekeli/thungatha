import { JobDiscoveryDialogs } from "./job-discovery-dialogs";
import { AuthenticatedJobWorkspace } from "./job-discovery-workspace";
import { JobDiscoveryControls } from "./job-discovery-controls";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { useJobDiscoveryState } from "../hooks/use-job-discovery-state";
import { useJobDiscoveryController } from "../hooks/use-job-discovery-controller";
import { formatDate, shown, sourceFor } from "../job-discovery-utils";

type State = ReturnType<typeof useJobDiscoveryState>;
type Controller = ReturnType<typeof useJobDiscoveryController>;

export function JobDiscoveryScreen({ configured, state: s, controller: c, routerPushProfile }: {
  configured: boolean; state: State; controller: Controller; routerPushProfile: () => void;
}) {
  return <WorkspaceShell active="/jobs" configured={configured}><main className="th-jobs-page th-jobs-redesign">
    <JobDiscoveryControls isAuthenticated={s.isAuthenticated} draft={s.draft} filtersOpen={s.filtersOpen} categories={c.categories} category={s.category} sortOrder={s.sortOrder}
      onQueryChange={(v) => c.changeDraft("query", v)} onLocationChange={(v) => c.changeDraft("location", v)} onSubmit={c.submitFilters}
      onToggleFilters={() => s.setFiltersOpen((v) => !v)} onSortChange={s.setSortOrder}
      onCategoryChange={(key, label) => { if (key === "all" || key === "saved" || key === "dismissed") { s.setCategory(key === "all" ? "new" : key); s.setPage(1); return; } c.changeDraft("employmentType", label); s.setFilters((current) => ({ ...current, employmentType: label })); s.setPage(1); }}
      undoAction={s.undoAction} stateBusy={s.stateBusy} onUndo={() => void c.undoLastStateChange()} onDismissUndo={() => s.setUndoAction(null)}
      stateMessage={s.stateMessage} onDismissMessage={() => s.setStateMessage(null)} stateError={s.stateError} onDismissError={() => s.setStateError(null)} />
    <AuthenticatedJobWorkspace jobs={c.visibleJobs} feed={s.feed} loading={s.loading} error={s.error} hasFilters={c.hasFilters} mobileDetail={s.mobileDetail} selectedId={s.selectedId}
      loadMoreRef={s.loadMoreRef} selectedDetail={c.selectedDetail} selectedSource={c.selectedSource} applicationDestination={c.applicationDestination}
      applicationUrl={c.applicationUrl} jobSourceUrl={c.jobSourceUrl} busy={s.stateBusy} detailLoading={s.detailLoading} activityError={s.activityError} detailError={s.detailError}
      sourceFor={sourceFor} formatDate={formatDate} onRetryFeed={() => s.setRetryFeed((v) => v + 1)}
      onSaveJob={(job) => void c.updateJobState(job, job.state === "saved" ? null : "saved")}
      onSelect={(job) => { s.setSelectedId(job.id); s.setForceAppliedPrompt(false); s.setDismissedPromptForJobId(null); s.setActivityError(null); s.setMobileDetail(true); }}
      onBack={() => s.setMobileDetail(false)} onViewMatch={() => s.setMatchOpen(true)}
      onApply={() => c.applicationDestination && c.openApplicationLink(c.selectedDetail!, c.applicationDestination)}
      onSave={() => c.selectedDetail && void c.updateJobState(c.selectedDetail, c.selectedDetail.state === "saved" ? null : "saved")}
      onDismiss={() => c.selectedDetail && void c.updateJobState(c.selectedDetail, c.selectedDetail.state === "dismissed" ? null : "dismissed")}
      onRetryDetail={() => s.setRetryDetail((v) => v + 1)} />
    <JobDiscoveryDialogs filtersOpen={s.filtersOpen} draft={s.draft} changeDraft={c.changeDraft} clearFilters={c.clearFilters} setFilters={s.setFilters} setPage={s.setPage}
      setMobileDetail={s.setMobileDetail} setFiltersOpen={s.setFiltersOpen} profileSetupPrompt={s.profileSetupPrompt} setProfileSetupPrompt={s.setProfileSetupPrompt}
      routerPushProfile={routerPushProfile} matchOpen={s.matchOpen} setMatchOpen={s.setMatchOpen}
      showApplicationPrompt={Boolean(c.selectedDetail && (s.forceAppliedPrompt || (Boolean(c.selectedActivity?.application_link_opened_at) && !c.selectedActivity?.applied_at && s.dismissedPromptForJobId !== s.selectedId)))}
      stateBusy={s.stateBusy} jobTitle={c.selectedDetail?.title ?? ""} employer={shown(c.selectedDetail?.employer_name)}
      onCloseApplicationPrompt={() => { s.setForceAppliedPrompt(false); if (c.selectedDetail) s.setDismissedPromptForJobId(c.selectedDetail.id); }}
      onConfirmApplied={() => void c.confirmApplied()} />
  </main></WorkspaceShell>;
}
