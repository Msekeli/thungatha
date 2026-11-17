"use client";

import { Dialog } from "@base-ui/react/dialog";
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
  const open = Boolean(job);
  const employer = job?.employer_name?.trim() || "this employer";

  return (
    <Dialog.Root open={open} onOpenChange={(next) => !next && onClose()}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-[1700] bg-overlay backdrop-blur-sm" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 z-[1701] w-[min(460px,calc(100vw-28px))] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-line bg-panel p-5 text-fg shadow-2xl outline-none sm:p-6">
          <Dialog.Title className="text-lg font-semibold">
            What would you like to dismiss?
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-sm leading-6 text-fg-muted">
            Choose whether this applies only to this vacancy or to every job from {employer}.
          </Dialog.Description>

          <div className="mt-5 grid gap-3">
            <button
              type="button"
              disabled={busy || !job}
              onClick={() => onConfirm("job")}
              className="rounded-xl border border-line bg-panel p-4 text-left transition hover:border-accent hover:bg-panel-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50"
            >
              <span className="block text-sm font-semibold">Dismiss this job only</span>
              <span className="mt-1 block text-sm leading-5 text-fg-muted">
                Hide “{job?.title ?? "this vacancy"}”. You may still see other jobs from {employer}.
              </span>
            </button>
            <button
              type="button"
              disabled={busy || !job || !job.employer_name?.trim()}
              onClick={() => onConfirm("employer")}
              className="rounded-xl border border-line bg-panel p-4 text-left transition hover:border-accent hover:bg-panel-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50"
            >
              <span className="block text-sm font-semibold">Dismiss {employer}</span>
              <span className="mt-1 block text-sm leading-5 text-fg-muted">
                Hide all current and future jobs from this employer.
              </span>
            </button>
          </div>

          <div className="mt-5 flex justify-end">
            <Button variant="outline" disabled={busy} onClick={onClose}>
              Cancel
            </Button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
