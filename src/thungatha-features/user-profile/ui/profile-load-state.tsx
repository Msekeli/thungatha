"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function ProfileFormLoadState({
  loading,
  error,
  onRetry,
}: {
  loading: boolean;
  error: string;
  onRetry: () => Promise<void>;
}) {
  if (loading)
    return (
      <div
        className="space-y-4 py-6"
        aria-busy="true"
        aria-label="Loading profile"
      >
        <p role="status" className="sr-only">
          Loading your profile…
        </p>
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );

  return (
    <div className="space-y-3 rounded-xl border border-line bg-panel p-6 text-center">
      <p role="alert" className="text-sm text-warn">
        {error}
      </p>
      <button
        type="button"
        onClick={() => void onRetry()}
        className="rounded-lg border border-line px-4 py-2 text-xs font-semibold text-fg hover:bg-panel-2"
      >
        Try again
      </button>
    </div>
  );
}
