"use client";

import { Button } from "@/components/ui/button";
import type { Suitability } from "./cv-studio-types";

export function CvStudioSuitabilityPanel({
  suitability,
  busy,
  error,
  onUseVersion,
}: {
  suitability: Suitability | null;
  busy: boolean;
  error: string | null;
  onUseVersion: (id: string) => void;
}) {
  return (
    <div
      className="mt-4 rounded-xl border border-line bg-panel-2 p-3"
      aria-live="polite"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-fg-muted">
          CV for this job
        </p>
        {busy && (
          <span className="text-xs text-fg-muted">Checking saved CVs…</span>
        )}
        {suitability?.matchingVersions.length ? (
          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600">
            Existing CV available
          </span>
        ) : null}
        {suitability && !suitability.matchingVersions.length ? (
          <span className="rounded-full border border-line px-2.5 py-1 text-xs font-medium text-fg-muted">
            No existing CV for this exact job
          </span>
        ) : null}
      </div>
      {suitability?.matchingVersions.map((version) => (
        <div
          key={version.id}
          className="mt-2 flex flex-wrap items-center justify-between gap-2"
        >
          <div>
            <p className="text-sm font-medium text-fg">
              Accepted CV · Version {version.versionNumber}
            </p>
            <p className="text-xs text-fg-muted">
              Updated {new Date(version.updatedAt).toLocaleDateString()}
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            disabled={busy}
            onClick={() => onUseVersion(version.id)}
          >
            Use saved CV for this job
          </Button>
        </div>
      ))}
      {error && (
        <p className="mt-2 text-sm text-rose-700" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
