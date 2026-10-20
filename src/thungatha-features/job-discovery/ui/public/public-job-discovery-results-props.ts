import type { PublicJob } from "./public-job-types";

export type PublicJobDiscoveryResultsProps = {
  jobs: PublicJob[];
  visibleJobs: PublicJob[];
  configured: boolean;
  loading: boolean;
  error: string | null;
  total: number;
  dismissedCount: number;
  showingDismissed: boolean;
  selectedId: string | null;
  hasActiveFilters: boolean;
  sort: string;
  query: string;
  promoVisible: boolean;
  dateLabel: (value: string | null | undefined) => string;
  sourceFor: (job: PublicJob | null) => { published_at?: string | null } | null;
  onToggleDismissed: () => void;
  onClearFilters: () => void;
  onSortChange: (value: string) => void;
  onQueryChange: (value: string) => void;
  onOpenFilters: (anchorEl: HTMLElement) => void;
  onRetry: () => void;
  onDismiss: (id: string) => void;
  onRestore: (id: string) => void;
  onSelect: (id: string) => void;
  onPromoDismiss: () => void;
};
