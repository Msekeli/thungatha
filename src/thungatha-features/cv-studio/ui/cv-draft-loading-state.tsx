"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function CvDraftLoadingState({
  error,
  createFailed,
  busy,
  onRetry,
}: {
  error: string | null;
  createFailed: boolean;
  busy: boolean;
  onRetry: () => void;
}) {
  return (
    <div
      className="flex h-full flex-col justify-center gap-4"
      role="status"
      aria-live="polite"
    >
      <p className="text-sm font-medium">Preparing your tailored CV…</p>
      <Skeleton className="h-5 w-2/5" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-16 w-full" />
      {error && <p className="text-sm text-destructive">{error}</p>}
      {createFailed && (
        <Button className="w-fit" size="sm" onClick={onRetry} disabled={busy}>
          Retry
        </Button>
      )}
    </div>
  );
}
