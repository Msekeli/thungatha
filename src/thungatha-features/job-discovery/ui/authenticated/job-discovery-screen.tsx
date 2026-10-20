import Box from "@mui/material/Box";
import { useEffect } from "react";
import { JobDiscoveryDialogs } from "./job-discovery-dialogs";
import { AuthenticatedJobWorkspace } from "./job-discovery-workspace";
import { JobDiscoveryControls } from "./job-discovery-controls";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { useJobDiscoveryState } from "../hooks/use-job-discovery-state";
import { useJobDiscoveryController } from "../hooks/use-job-discovery-controller";
import { formatDate, shown, sourceFor } from "../job-discovery-utils";
import { employmentTypeForJobType } from "../shared/job-discovery-controls";

type State = ReturnType<typeof useJobDiscoveryState>;
type Controller = ReturnType<typeof useJobDiscoveryController>;

export function JobDiscoveryScreen({
  configured,
  state: s,
  controller: c,
  routerPushProfile,
}: {
  configured: boolean;
  state: State;
  controller: Controller;
  routerPushProfile: () => void;
}) {
  const showApplicationPrompt = Boolean(
    c.selectedDetail &&
    (s.forceAppliedPrompt ||
      (Boolean(c.selectedActivity?.application_link_opened_at) &&
        !c.selectedActivity?.applied_at &&
        s.dismissedPromptForJobId !== s.selectedId)),
  );

  useEffect(() => {
    if (!showApplicationPrompt || s.applicationPromptAnchorEl?.isConnected) return;
    const anchor = document.querySelector<HTMLElement>("[data-job-application-trigger]");
    if (anchor) s.setApplicationPromptAnchorEl(anchor);
  }, [showApplicationPrompt, s.applicationPromptAnchorEl, s.selectedId, s.setApplicationPromptAnchorEl]);

  useEffect(() => {
    if (!s.profileSetupPrompt || s.profileSetupAnchorEl?.isConnected) return;
    const candidates = Array.from(document.querySelectorAll<HTMLElement>(
      '.th-workspace-sidebar a[href="/profile"], .th-mobile-workspace-header-actions button[aria-controls="th-mobile-workspace-menu"]',
    ));
    const anchor = candidates.find((element) => element.getClientRects().length > 0);
    if (anchor) s.setProfileSetupAnchorEl(anchor);
  }, [s.profileSetupPrompt, s.profileSetupAnchorEl, s.setProfileSetupAnchorEl]);

  return (
    <WorkspaceShell active="/jobs" configured={configured}>
      <Box
        component="main"
        className="th-jobs-page th-jobs-redesign"
        sx={{
          width: "min(calc(100% - 40px), 1600px)",
          pt: 2.25,
          pb: 2.25,
          "@media (max-width: 760px)": { width: "100%", p: 1.5 },
        }}
      >
        <JobDiscoveryControls
          isAuthenticated={s.isAuthenticated}
          draft={s.draft}
          filtersOpen={s.filtersOpen}
          categories={c.categories}
          category={s.filters.employmentType || s.category}
          sortOrder={s.sortOrder}
          onQueryChange={(v) => c.changeDraft("query", v)}
          onLocationChange={(v) => c.changeDraft("location", v)}
          onSubmit={c.submitFilters}
          onToggleFilters={(anchorEl) => {
            s.setFilterAnchorEl(anchorEl);
            s.setFiltersOpen((v) => !v);
          }}
          onSortChange={s.setSortOrder}
          onCategoryChange={(key, label) => {
            if (key === "saved" || key === "dismissed") {
              s.setCategory(key);
              s.setPage(1);
              return;
            }
            s.setCategory("new");
            const employmentType = employmentTypeForJobType(key);
            c.changeDraft("employmentType", employmentType);
            s.setFilters((current) => ({ ...current, employmentType }));
            s.setPage(1);
          }}
          undoAction={s.undoAction}
          stateBusy={s.stateBusy}
          onUndo={() => void c.undoLastStateChange()}
          onDismissUndo={() => s.setUndoAction(null)}
          stateMessage={s.stateMessage}
          onDismissMessage={() => s.setStateMessage(null)}
          stateError={s.stateError}
          onDismissError={() => s.setStateError(null)}
        />
        <AuthenticatedJobWorkspace
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
          formatDate={formatDate}
          onRetryFeed={() => s.setRetryFeed((v) => v + 1)}
          onSaveJob={(job) =>
            void c.updateJobState(job, job.state === "saved" ? null : "saved")
          }
          onSelect={(job) => {
            s.setSelectedId(job.id);
            s.setApplicationPromptAnchorEl(null);
            s.setMatchAnchorEl(null);
            s.setMatchOpen(false);
            s.setForceAppliedPrompt(false);
            s.setActivityError(null);
            s.setMobileDetail(true);
          }}
          onBack={() => s.setMobileDetail(false)}
          onViewMatch={(anchorEl) => {
            s.setMatchAnchorEl(anchorEl);
            s.setMatchOpen(true);
          }}
          onApply={(anchorEl) => {
            s.setApplicationPromptAnchorEl(anchorEl);
            if (c.applicationDestination && c.selectedDetail) {
              c.openApplicationLink(c.selectedDetail, c.applicationDestination);
            }
          }}
          onSave={() =>
            c.selectedDetail &&
            void c.updateJobState(
              c.selectedDetail,
              c.selectedDetail.state === "saved" ? null : "saved",
            )
          }
          onDismiss={() =>
            c.selectedDetail &&
            void c.updateJobState(
              c.selectedDetail,
              c.selectedDetail.state === "dismissed" ? null : "dismissed",
            )
          }
          onRetryDetail={() => s.setRetryDetail((v) => v + 1)}
        />
        <JobDiscoveryDialogs
          filtersOpen={s.filtersOpen}
          filterAnchorEl={s.filterAnchorEl}
          draft={s.draft}
          changeDraft={c.changeDraft}
          clearFilters={c.clearFilters}
          setFilters={s.setFilters}
          setPage={s.setPage}
          setMobileDetail={s.setMobileDetail}
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
          showApplicationPrompt={showApplicationPrompt}
          stateBusy={s.stateBusy}
          jobTitle={c.selectedDetail?.title ?? ""}
          employer={shown(c.selectedDetail?.employer_name)}
          onCloseApplicationPrompt={() => {
            s.setForceAppliedPrompt(false);
            if (c.selectedDetail)
              s.setDismissedPromptForJobId(c.selectedDetail.id);
          }}
          onConfirmApplied={() => void c.confirmApplied()}
        />
      </Box>
    </WorkspaceShell>
  );
}
