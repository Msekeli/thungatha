"use client";

import Link from "next/link";
import { BriefcaseBusiness, X } from "lucide-react";
import { AnchoredPopover } from "@/components/ui/anchored-popover";
import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  anchorEl: HTMLElement | null;
  busy: boolean;
  jobTitle: string;
  employer: string;
  onClose: () => void;
  onConfirm: () => void;
};

export function ApplicationConfirmationDialog({
  open,
  anchorEl,
  busy,
  jobTitle,
  employer,
  onClose,
  onConfirm,
}: Props) {
  return (
    <AnchoredPopover
      open={open}
      anchor={anchorEl}
      onClose={onClose}
      label="Application confirmation"
      className="max-h-[min(72dvh,520px)] w-[min(400px,calc(100vw-24px))] overflow-y-auto rounded-xl border border-line bg-panel text-fg shadow-xl"
    >
      <header className="flex items-center justify-between gap-4 border-b border-line px-4 py-3">
        <span className="inline-flex items-center gap-2 font-semibold">
          <BriefcaseBusiness size={18} />
          Application status
        </span>
        <Button
          variant="ghost"
          size="sm"
          aria-label="Close application confirmation"
          onClick={onClose}
        >
          <X size={16} />
        </Button>
      </header>
      <div className="p-4">
        <h3 className="mb-2 mt-0 text-base font-bold">Did you apply?</h3>
        <p className="mb-4 mt-0 leading-relaxed text-fg-muted">
          You opened the application page for <strong>{jobTitle}</strong> at{" "}
          <strong>{employer}</strong>. Have you submitted your application?
        </p>
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="secondary" disabled={busy} onClick={onClose}>
            Not yet
          </Button>
          <Button variant="primary" disabled={busy} onClick={onConfirm}>
            {busy ? "Saving…" : "Yes, I applied"}
          </Button>
        </div>
        <aside className="mt-4 rounded-lg bg-[var(--th-tag-bg)] p-3 text-sm leading-relaxed text-fg-muted">
          This will be recorded in your{" "}
          <Link className="text-accent underline" href="/tracking">
            Job Tracking
          </Link>{" "}
          so you can follow up later.
        </aside>
      </div>
    </AnchoredPopover>
  );
}
