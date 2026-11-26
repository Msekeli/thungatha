import { Button } from "@/components/ui/button";
import type { CvPdfContent } from "./cv-pdf-document";

type SavedCvCardProps = {
  version: {
    id: string;
    cv_kind: "master" | "tailored";
    version_number: number;
    content: CvPdfContent;
    accent_colour: "teal" | "navy" | "burgundy" | "forest";
    source_job_snapshot: { title?: string; company?: string | null } | null;
    updated_at: string;
    accepted_at: string | null;
  };
  onSelect: () => void;
};

export function SavedCvCard({ version, onSelect }: SavedCvCardProps) {
  const master = version.cv_kind === "master";
  return (
    <article className="flex min-w-0 flex-col rounded-xl border border-line bg-panel-2 p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="rounded-full border border-line px-2 py-1 text-xs font-medium text-fg-muted">
          {master ? "Master" : "Tailored"}
        </span>
        <span className="text-xs text-fg-muted">{master ? "Current" : "Accepted"}</span>
      </div>
      <h3 className="line-clamp-2 font-semibold text-fg">
        {version.source_job_snapshot?.title ?? "Master CV"}
      </h3>
      <p className="mt-1 min-h-5 text-sm text-fg-muted">
        {version.source_job_snapshot?.company ?? "General CV"}
      </p>
      <p className="mt-3 text-xs text-fg-muted">
        Version {version.version_number} · {new Date(version.accepted_at ?? version.updated_at).toLocaleDateString()}
      </p>
      <Button className="mt-4 w-full" size="sm" variant="outline" onClick={onSelect}>
        Preview and download
      </Button>
    </article>
  );
}
