"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application root error:", {
      digest: error.digest,
      errorName: error.name,
    });
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-white text-slate-900">
        <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-6 py-16 text-center">
          <h1 className="text-2xl font-semibold">
            Thungatha is temporarily unavailable
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            Something went wrong while opening the application. Please try
            again.
          </p>

          {error.digest && (
            <p className="mt-3 text-xs text-slate-500">
              Reference: {error.digest}
            </p>
          )}

          <button
            type="button"
            onClick={reset}
            className="mt-6 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
