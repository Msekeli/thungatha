import { useJobApplicationActions } from "./use-job-application-actions";
import { useConfirmJobApplied } from "./use-confirm-job-applied";
import { useJobFilterActions } from "./use-job-filter-actions";
import { useJobDiscoveryWorkspaceActions } from "./use-job-discovery-workspace-actions";
import { useJobDiscoveryData } from "./use-job-discovery-data";
import { buildJobDiscoveryViewModel } from "../job-discovery-view-model";
import { formatDate, shown, sourceFor } from "../job-discovery-utils";
import type { useJobDiscoveryState } from "./use-job-discovery-state";
type DiscoveryState = ReturnType<typeof useJobDiscoveryState>;

export function useJobDiscoveryController(s: DiscoveryState) {
  const data = useJobDiscoveryData(s);
  const view = buildJobDiscoveryViewModel({
    detail: s.detail,
    selectedId: s.selectedId,
    feed: s.feed,
    jobActivity: s.jobActivity,
    filters: s.filters,
    sortOrder: s.sortOrder,
  });
  const application = useJobApplicationActions(
    s.userSignedIn,
    s.setStateError,
    s.setJobActivity,
    s.setForceAppliedPrompt,
    s.setDismissedPromptForJobId,
  );
  const confirmApplied = useConfirmJobApplied(
    view.selectedDetail,
    s.stateBusy,
    s.setStateBusy,
    s.setStateError,
    s.setStateMessage,
    s.setJobActivity,
    s.setForceAppliedPrompt,
    s.setDismissedPromptForJobId,
    s.setRetryFeed,
  );
  const filters = useJobFilterActions(
    s.draft,
    s.setDraft,
    s.setFilters,
    s.setCategory,
    s.setPage,
    s.setMobileDetail,
  );
  const workspaceActions = useJobDiscoveryWorkspaceActions(
    s,
    view.selectedDetail,
    view.applicationDestination,
    data.updateJobState,
    application.openApplicationLink,
  );
  const showApplicationPrompt = Boolean(
    view.selectedDetail &&
    (s.forceAppliedPrompt ||
      (Boolean(view.selectedActivity?.application_link_opened_at) &&
        !view.selectedActivity?.applied_at &&
        s.dismissedPromptForJobId !== s.selectedId)),
  );
  return {
    ...data,
    ...view,
    ...application,
    confirmApplied,
    workspaceActions,
    showApplicationPrompt,
    ...filters,
    formatDate,
    shown,
    sourceFor,
  };
}
