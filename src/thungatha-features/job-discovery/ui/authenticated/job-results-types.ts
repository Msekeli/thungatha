import type { RefObject } from "react";
import type { Feed, Job } from "../job-discovery-utils";

export type { Feed, Job } from "../job-discovery-utils";

export type JobResultsPanelProps = {
  jobs: Job[];
  feed: Feed | null;
  loading: boolean;
  error: string | null;
  hasFilters: boolean;
  mobileDetail: boolean;
  selectedId: string | null;
  loadMoreRef: RefObject<HTMLDivElement | null>;
  formatDate: (value: string | null | undefined) => string | null;
  onRetry: () => void;
  onSelect: (job: Job) => void;
  onSave: (job: Job) => void;
  onDismiss: (job: Job) => void;
  configured: boolean;
  resultCount: number;
  category: string;
  dismissedCount: number;
  isAuthenticated: boolean;
  sortOrder: string;
  onSortOrderChange: (value: string) => void;
  onCategoryChange: (key: string, label: string) => void;
};
