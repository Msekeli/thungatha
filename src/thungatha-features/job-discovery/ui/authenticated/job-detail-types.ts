import type { Job } from "./job-results-types";

export type JobDetailContentProps = {
  configured: boolean;
  job: Job | null;
  applicationDestination: string | null;
  applicationUrl: string | null;
  busy: boolean;
  detailLoading: boolean;
  activityError: string | null;
  detailError: string | null;
  formatDate: (value: string | null | undefined) => string | null;
  onBack: () => void;
  onViewMatch: (anchorEl: HTMLElement) => void;
  onApply: (anchorEl: HTMLElement) => void;
  onSave: () => void;
  onDismiss: () => void;
  onRetry: () => void;
};
