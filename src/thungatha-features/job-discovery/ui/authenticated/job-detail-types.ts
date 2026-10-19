import type { Job, JobSource } from "./job-results-types";

export type JobDetailContentProps = {
  job: Job | null;
  source: JobSource | null;
  applicationDestination: string | null;
  applicationUrl: string | null;
  jobSourceUrl: string | null;
  busy: boolean;
  detailLoading: boolean;
  activityError: string | null;
  detailError: string | null;
  formatDate: (value: string | null | undefined) => string | null;
  onBack: () => void;
  onViewMatch: () => void;
  onApply: () => void;
  onSave: () => void;
  onDismiss: () => void;
  onRetry: () => void;
};
