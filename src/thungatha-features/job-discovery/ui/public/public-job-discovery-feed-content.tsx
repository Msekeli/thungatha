import { PublicJobDiscoveryJobList } from "./public-job-discovery-job-list";
import { PublicJobDiscoveryResultState } from "./public-job-discovery-result-state";
import { PublicJobPromo } from "./public-job-promo";
import type { PublicJob } from "./public-job-types";

export function PublicJobDiscoveryFeedContent({
  visibleJobs,
  loading,
  error,
  showingDismissed,
  selectedId,
  configured,
  promoVisible,
  dateLabel,
  sourceFor,
  onRetry,
  onDismiss,
  onRestore,
  onSelect,
  onPromoDismiss,
}: {
  visibleJobs: PublicJob[];
  loading: boolean;
  error: string | null;
  showingDismissed: boolean;
  selectedId: string | null;
  configured: boolean;
  promoVisible: boolean;
  dateLabel: (value: string | null | undefined) => string;
  sourceFor: (job: PublicJob | null) => { published_at?: string | null } | null;
  onRetry: () => void;
  onDismiss: (id: string) => void;
  onRestore: (id: string) => void;
  onSelect: (id: string) => void;
  onPromoDismiss: () => void;
}) {
  return (
    <>
      <PublicJobDiscoveryResultState
        error={showingDismissed ? null : error}
        loading={loading && !showingDismissed}
        resultCount={visibleJobs.length}
        onRetry={onRetry}
        showStatus
      />
      <PublicJobDiscoveryJobList
        jobs={visibleJobs.map((job) => ({
          job,
          postedLabel: dateLabel(sourceFor(job)?.published_at),
        }))}
        selectedId={selectedId}
        configured={configured}
        dismissed={showingDismissed}
        onDismiss={onDismiss}
        onRestore={onRestore}
        onSelect={onSelect}
      />
      <PublicJobDiscoveryResultState
        loading={loading && !showingDismissed}
        resultCount={visibleJobs.length}
        showLoading
      />
      {promoVisible && (
        <PublicJobPromo
          configured={configured}
          variant="inline"
          onDismiss={onPromoDismiss}
        />
      )}
    </>
  );
}
