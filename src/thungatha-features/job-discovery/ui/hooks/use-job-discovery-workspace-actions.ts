import type { useJobDiscoveryState } from "./use-job-discovery-state";
import type { Job } from "../job-discovery-utils";

type State = ReturnType<typeof useJobDiscoveryState>;
type UpdateJobState = (
  job: Job,
  state: "saved" | "dismissed" | null,
) => Promise<boolean>;

export function useJobDiscoveryWorkspaceActions(
  state: State,
  selectedJob: Job | null,
  applicationDestination: string | null,
  updateJobState: UpdateJobState,
  openApplicationLink: (job: Job, url: string) => void,
) {
  function selectJob(job: Job) {
    state.setSelectedId(job.id);
    state.setDismissedPromptForJobId(null);
    state.setApplicationPromptAnchorEl(null);
    state.setMatchAnchorEl(null);
    state.setMatchOpen(false);
    state.setForceAppliedPrompt(false);
    state.setActivityError(null);
    state.setMobileDetail(true);
  }

  function saveJob(job: Job) {
    void updateJobState(job, job.state === "saved" ? null : "saved");
  }

  function saveSelectedJob() {
    if (selectedJob) saveJob(selectedJob);
  }

  function dismissSelectedJob() {
    if (selectedJob)
      void updateJobState(
        selectedJob,
        selectedJob.state === "dismissed" ? null : "dismissed",
      );
  }

  function applySelectedJob(anchorEl: HTMLElement) {
    state.setApplicationPromptAnchorEl(anchorEl);
    if (applicationDestination && selectedJob)
      openApplicationLink(selectedJob, applicationDestination);
  }

  function dismissAppliedPrompt() {
    state.setForceAppliedPrompt(false);
    if (selectedJob) state.setDismissedPromptForJobId(selectedJob.id);
  }

  return {
    retryFeed: () => state.setRetryFeed((value) => value + 1),
    retryDetail: () => state.setRetryDetail((value) => value + 1),
    selectJob,
    saveJob,
    showResults: () => state.setMobileDetail(false),
    viewMatch: (anchorEl: HTMLElement) => {
      state.setMatchAnchorEl(anchorEl);
      state.setMatchOpen(true);
    },
    applySelectedJob,
    saveSelectedJob,
    dismissSelectedJob,
    dismissAppliedPrompt,
  };
}
