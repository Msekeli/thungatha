"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { AnchoredPopover } from "@/components/ui/anchored-popover";
import { Button } from "@/components/ui/button";
import type { Job } from "../job-discovery-utils";

export function JobDismissalDialog({
  job,
  busy,
  onClose,
  onConfirm,
}: {
  job: Job | null;
  busy: boolean;
  onClose: () => void;
  onConfirm: (scope: "job" | "employer") => void;
}) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const employer = job?.employer_name?.trim() || "this employer";

  useEffect(() => {
    if (job) {
      const activeElement = document.activeElement;
      setAnchor(activeElement instanceof HTMLElement ? activeElement : null);
    } else {
      setAnchor(null);
    }
  }, [job]);

  return (
    <AnchoredPopover
      open={Boolean(job)}
      anchor={anchor}
      onClose={onClose}
      label="Dismiss job options"
      className="relative w-[min(380px,calc(100vw-24px))] rounded-xl border border-line bg-panel p-4 text-fg shadow-xl"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="m-0 text-base font-semibold">What would you like to dismiss?</h2>
          <p className="mb-0 mt-1 text-sm leading-5 text-fg-muted">
            Choose whether this applies only to this vacancy or to every job from {employer}.
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Close dismissal options"
          disabled={busy}
          onClick={onClose}
        >
          <X size={16} />
        </Button>
      </div>

      <div className="mt-4 grid gap-2">
        <button
          type="button"
          disabled={busy || !job}
          onClick={() => onConfirm("job")}
          className="rounded-lg border border-line bg-panel p-3 text-left transition hover:border-accent hover:bg-panel-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50"
        >
          <span className="block text-sm font-semibold">Dismiss this job only</span>
          <span className="mt-1 block text-sm leading-5 text-fg-muted">
            Hide “{job?.title ?? "this vacancy"}”. Other jobs from {employer} may still appear.
          </span>
        </button>
        <button
          type="button"
          disabled={busy || !job || !job.employer_name?.trim()}
          onClick={() => onConfirm("employer")}
          className="rounded-lg border border-line bg-panel p-3 text-left transition hover:border-accent hover:bg-panel-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50"
        >
          <span className="block text-sm font-semibold">Dismiss {employer}</span>
          <span className="mt-1 block text-sm leading-5 text-fg-muted">
            Hide all current and future jobs from this employer.
          </span>
        </button>
      </div>

      <div className="mt-3 flex justify-end">
        <Button variant="outline" size="sm" disabled={busy} onClick={onClose}>
          Cancel
        </Button>
      </div>
    </AnchoredPopover>
  );
}
