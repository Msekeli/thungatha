import { Button } from "@/components/ui/button";

export function JobDetailStatus({
  activityError,
  detailError,
  onRetry,
}: {
  activityError: string | null;
  detailError: string | null;
  applicationUrl?: string | null;
  onRetry: () => void;
}) {
  return (
    <>
      {activityError && (
        <p className="text-sm text-destructive" role="status">
          {activityError}
        </p>
      )}
      {detailError && (
        <div
          className="flex flex-wrap items-center gap-2 text-sm text-destructive"
          role="status"
        >
          <span>{detailError}</span>
          <Button variant="outline" size="sm" onClick={onRetry}>
            Retry
          </Button>
        </div>
      )}
    </>
  );
}
