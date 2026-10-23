import { Button } from "@/components/ui/button";

export function JobDetailStatus({
  activityError,
  detailError,
  applicationUrl,
  onRetry,
}: {
  activityError: string | null;
  detailError: string | null;
  applicationUrl: string | null;
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
          className="flex items-center gap-2 text-sm text-destructive"
          role="status"
        >
          <span>{detailError}</span>
          <Button variant="outline" size="sm" onClick={onRetry}>
            Retry
          </Button>
        </div>
      )}
      <div className="th-jobs-source-status">
        <span data-available={Boolean(applicationUrl)}>
          {applicationUrl
            ? "✓ Application destination available"
            : "! Employer application link not verified"}
        </span>
      </div>
    </>
  );
}
