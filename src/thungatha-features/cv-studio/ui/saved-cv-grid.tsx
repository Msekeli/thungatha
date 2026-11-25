"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { CvPdfContent } from "./cv-pdf-document";
import { SavedCvCard } from "./saved-cv-card";

type SavedCv = {
  id: string;
  cv_kind: "master" | "tailored";
  version_number: number;
  content: CvPdfContent;
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
        {versions.map((version) => (
          <SavedCvCard key={version.id} version={version} onSelect={() => setSelected(version)} />
        ))}
      </div>
      </>}
    </section>
  );
}
