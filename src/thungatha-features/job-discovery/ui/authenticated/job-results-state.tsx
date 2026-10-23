import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  loading: boolean;
  hasFeed: boolean;
  error: string | null;
  hasJobs: boolean;
  hasFilters: boolean;
  onRetry: () => void;
};

const stateClass =
  "flex flex-col items-start gap-3 px-2 py-7 text-xs text-fg-muted";

export function JobResultsState({
  loading,
  hasFeed,
  error,
  hasJobs,
  hasFilters,
  onRetry,
}: Props) {
  if (loading && !hasFeed)
    return (
      <div role="status" className={stateClass}>
        <LoaderCircle size={20} className="animate-spin" aria-label="Loading opportunities" />
        <strong className="text-sm font-semibold text-fg">
          Loading opportunities
        </strong>
      </div>
    );
  if (error)
    return (
      <div role="alert" className={stateClass}>
        <strong className="text-sm font-semibold text-fg">
          We couldn’t load opportunities
        </strong>
        <p className="mb-1 m-0 leading-relaxed">{error}</p>
        <Button onClick={onRetry} variant="outline">Retry</Button>
      </div>
    );
  if (hasJobs) return null;
  return (
    <div className={stateClass}>
      <strong className="text-sm font-semibold text-fg">
        {hasFilters
          ? "No opportunities match these filters"
          : "No active opportunities available"}
      </strong>
      <p className="mb-1 m-0 leading-relaxed">
        Try changing your search or filters.
      </p>
    </div>
  );
}
