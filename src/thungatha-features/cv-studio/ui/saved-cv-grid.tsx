"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type SavedCv = {
  id: string;
  cv_kind: "master" | "tailored";
  version_number: number;
  content: unknown;
  accent_colour: "teal" | "navy" | "burgundy" | "forest";
  source_job_snapshot: { title?: string; company?: string | null } | null;
  updated_at: string;
  accepted_at: string | null;
};

const accents = {
  teal: "#0F766E",
  navy: "#1D4ED8",
  burgundy: "#9F1239",
  forest: "#166534",
};

import { SavedCvPreview } from "./saved-cv-preview";

export function SavedCvGrid() {
  const [versions, setVersions] = useState<SavedCv[]>([]);
  const [selected, setSelected] = useState<SavedCv | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadVersions() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/cv-studio/versions", { cache: "no-store" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Saved CVs could not be loaded.");
      setVersions(body.versions as SavedCv[]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Saved CVs could not be loaded.");
    } finally {
      setLoading(false);
    }
  }



  return (
    <section className="space-y-3">
      {selected && <SavedCvPreview version={selected} onBack={() => setSelected(null)} />}
      {!selected && <>
      <div className="flex justify-end">
        <Button size="sm" variant="outline" onClick={() => void loadVersions()} disabled={loading}>
          {loading ? "Refreshing…" : "Refresh CVs"}
        </Button>
      </div>
      {loading && <p className="p-6 text-center text-sm text-fg-muted">Loading your saved CVs…</p>}
      {error && <p className="p-6 text-sm text-destructive" role="alert">{error}</p>}
      {!loading && !error && versions.length === 0 && (
        <p className="p-6 text-center text-sm text-fg-muted">No saved CV versions yet.</p>
      )}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {versions.map((version) => {
          const master = version.cv_kind === "master";
          return (
            <article key={version.id} className="flex min-w-0 flex-col rounded-xl border border-line bg-panel-2 p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <span className="rounded-full border border-line px-2 py-1 text-xs font-medium text-fg-muted">{master ? "Master" : "Tailored"}</span>
                <span className="text-xs text-fg-muted">{master ? "Current" : "Accepted"}</span>
              </div>
              <h3 className="line-clamp-2 font-semibold text-fg">{version.source_job_snapshot?.title ?? "Master CV"}</h3>
              <p className="mt-1 min-h-5 text-sm text-fg-muted">{version.source_job_snapshot?.company ?? "General CV"}</p>
              <p className="mt-3 text-xs text-fg-muted">Version {version.version_number} · {new Date(version.accepted_at ?? version.updated_at).toLocaleDateString()}</p>
              <Button className="mt-4 w-full" size="sm" variant="outline" onClick={() => setSelected(version)}>Preview and download</Button>
            </article>
          );
        })}
      </div>
      </>}
    </section>
  );
}
