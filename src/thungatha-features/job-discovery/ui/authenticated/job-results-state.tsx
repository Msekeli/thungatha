import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

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
      <div role="status" aria-label="Loading opportunities" className="w-full">
        <span className="sr-only">Loading opportunities</span>
        <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }, (_, index) => (
            <div
              key={index}
              className="flex min-w-0 flex-col gap-3 rounded-2xl border border-line bg-panel p-4"
            >
              <div className="flex items-start gap-3">
                <Skeleton className="size-11 shrink-0 rounded-xl" />
                <div className="flex min-w-0 flex-1 flex-col gap-2 pt-1">
                  <Skeleton className="h-4 w-4/5" />
                  <Skeleton className="h-3 w-2/5" />
                </div>
              </div>
              <Skeleton className="h-3 w-3/5" />
              <div className="mt-2 flex items-center justify-between border-t border-line pt-3">
                <Skeleton className="h-6 w-20 rounded-full" />
                <div className="flex gap-3">
                  <Skeleton className="size-4 rounded-sm" />
                  <Skeleton className="size-4 rounded-sm" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  if (error)
    return (
      <div role="alert" className={stateClass}>
        <strong className="text-sm font-semibold text-fg">
          We couldn’t load opportunities
        </strong>
        <p className="mb-1 m-0 leading-relaxed">{error}</p>
        <Button onClick={onRetry} variant="outline">
          Retry
        </Button>
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
