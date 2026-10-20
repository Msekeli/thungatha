"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application route error:", {
      digest: error.digest,
      errorName: error.name,
    });
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-6 py-16 text-center">
      <h1 className="text-2xl font-semibold text-slate-900">
        Something went wrong
      </h1>

      <p className="mt-3 text-sm leading-6 text-slate-600">
        We couldn’t load this page properly. Please try again.
      </p>

      {error.digest && (
        <p className="mt-3 text-xs text-slate-500">Reference: {error.digest}</p>
      )}

      <Button
        variant="primary"
        type="button"
        onClick={reset}
        className="mt-6 rounded-lg bg-brand-ink px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
      >
        Try again
      </Button>
    </main>
  );
}
