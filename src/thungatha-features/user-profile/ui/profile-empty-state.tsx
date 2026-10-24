"use client";

import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ProfileEmptyState({
  onStartManualEntry,
}: {
  onStartManualEntry: () => void;
}) {
  return (
    <div className="mx-auto max-w-2xl py-6">
      <p className="text-xs font-semibold uppercase tracking-wider text-fg-muted">
        Your information
      </p>
      <h1 className="mt-1 text-2xl font-bold tracking-tight text-fg sm:text-3xl">
        Professional profile
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-fg-muted">
        Add your details once and use them across Thungatha. Upload a CV to
        prefill them, then review everything before it is saved.
      </p>

      <div className="mt-8 rounded-xl border border-dashed border-line bg-panel p-8 text-center sm:p-10">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-panel-2 text-accent">
          <Upload size={22} />
        </div>
        <h2 className="mt-4 text-base font-semibold text-fg">Start with your CV</h2>
        <p className="mt-1 text-xs text-fg-muted">PDF or DOCX, up to 5 MB</p>

        <div className="mt-6 flex flex-col items-center gap-3">
          <Button
            type="button"
            variant="secondary"
            disabled
            className="w-full max-w-xs opacity-60"
            title="CV upload will be enabled in milestone C03"
          >
            Upload your CV (Coming in C03)
          </Button>

          <span className="text-xs text-fg-muted">or</span>

          <Button
            type="button"
            variant="primary"
            onClick={onStartManualEntry}
            className="w-full max-w-xs"
          >
            Enter details manually
          </Button>
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-fg-muted">
        Nothing is saved until you confirm it. Steps: 1 Upload · 2 Review
        prefilled details · 3 Save profile
      </p>
    </div>
  );
}
