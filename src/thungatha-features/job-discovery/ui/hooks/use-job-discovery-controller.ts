import { useJobApplicationActions } from "./use-job-application-actions";
import { useJobFilterActions } from "./use-job-filter-actions";
import { useJobDiscoveryData } from "./use-job-discovery-data";
import { buildJobDiscoveryViewModel } from "../job-discovery-view-model";
import { formatDate, shown, sourceFor } from "../job-discovery-utils";
import type { useJobDiscoveryState } from "./use-job-discovery-state";
type DiscoveryState = ReturnType<typeof useJobDiscoveryState>;

export function useJobDiscoveryController(s: DiscoveryState) {
  const data = useJobDiscoveryData(s);
  const view = buildJobDiscoveryViewModel({
    detail: s.detail, selectedId: s.selectedId, feed: s.feed,
    jobActivity: s.jobActivity, filters: s.filters, sortOrder: s.sortOrder,
  });
  const application = useJobApplicationActions(
    view.selectedDetail, s.stateBusy, s.setStateBusy, s.setStateError,
    s.setStateMessage, s.setJobActivity, s.setForceAppliedPrompt,
    s.setDismissedPromptForJobId, s.setRetryFeed,
  );
  const filters = useJobFilterActions(
    s.draft, s.setDraft, s.setFilters, s.setPage, s.setMobileDetail,
  );
  return { ...data, ...view, ...application, ...filters, formatDate, shown, sourceFor };
}
