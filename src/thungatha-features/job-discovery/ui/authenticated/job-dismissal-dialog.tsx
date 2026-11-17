"use client";

import { useEffect, useState } from "react";
import { Check, Circle, X } from "lucide-react";
import { AnchoredPopover } from "@/components/ui/anchored-popover";
import { Button } from "@/components/ui/button";
import type { Job } from "../job-discovery-utils";

type DismissalScope = "job" | "employer";

export function JobDismissalDialog({
  job,
  busy,
  onClose,
  onConfirm,
}: {
  job: Job | null;
  busy: boolean;
  onClose: () => void;
  onConfirm: (scope: DismissalScope) => void;
}) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [selectedScope, setSelectedScope] = useState<DismissalScope | null>(
    null,
  );
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const employer = job?.employer_name?.trim() || "this employer";
  const activeScope = selectedJobId === job?.id ? selectedScope : null;

  useEffect(() => {
    queueMicrotask(() => {
      if (job) {
        const activeElement = document.activeElement;
        setAnchor(activeElement instanceof HTMLElement ? activeElement : null);
      } else {
        setAnchor(null);
      }
    });
  }, [job]);

  const optionClass = (selected: boolean) =>
    [
      "flex w-full items-start gap-3 rounded-xl border-2 p-3 text-left transition-colors",
      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
      selected
        ? "border-accent bg-accent/10 ring-2 ring-accent/20"
        : "border-line bg-panel hover:border-accent/70 hover:bg-panel-2",
      "disabled:cursor-not-allowed disabled:opacity-50",
    ].join(" ");
  const close = () => {
    setSelectedJobId(null);
    setSelectedScope(null);
    onClose();
  };

  return (
    <AnchoredPopover
      open={Boolean(job)}
      anchor={anchor}
      onClose={close}
      label="Dismiss job options"
      className="relative w-[min(400px,calc(100vw-24px))] rounded-xl border border-line bg-panel p-4 text-fg shadow-xl"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="m-0 text-base font-semibold">
            What would you like to dismiss?
          </h2>
          <p className="mb-0 mt-1 text-sm leading-5 text-fg-muted">
            Select one option. You can review it before confirming.
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Close dismissal options"
          disabled={busy}
          onClick={close}
        >
          <X size={16} />
        </Button>
      </div>

      <div
        className="mt-4 grid gap-2"
        role="radiogroup"
        aria-label="Dismissal scope"
      >
        <button
          type="button"
          role="radio"
          aria-checked={activeScope === "job"}
          disabled={busy || !job}
          onClick={() => {
            setSelectedJobId(job?.id ?? null);
            setSelectedScope("job");
          }}
          className={optionClass(activeScope === "job")}
        >
          <span
            className={
              selectedScope === "job"
                ? "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground"
                : "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 border-fg-muted"
            }
          >
            {activeScope === "job" ? (
              <Check size={13} strokeWidth={3} />
            ) : (
              <Circle size={9} />
            )}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold">
              Dismiss this job only
            </span>
            <span className="mt-1 block text-sm leading-5 text-fg-muted">
              Hide “{job?.title ?? "this vacancy"}”. Other jobs from {employer}{" "}
              may still appear.
            </span>
          </span>
        </button>

        <button
          type="button"
          role="radio"
          aria-checked={activeScope === "employer"}
          disabled={busy || !job || !job.employer_name?.trim()}
          onClick={() => {
            setSelectedJobId(job?.id ?? null);
            setSelectedScope("employer");
          }}
          className={optionClass(activeScope === "employer")}
        >
          <span
            className={
              selectedScope === "employer"
                ? "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground"
                : "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 border-fg-muted"
            }
          >
            {activeScope === "employer" ? (
              <Check size={13} strokeWidth={3} />
            ) : (
              <Circle size={9} />
            )}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold">
              Dismiss {employer}
            </span>
            <span className="mt-1 block text-sm leading-5 text-fg-muted">
              Hide all current and future jobs from this employer.
            </span>
          </span>
        </button>
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <Button variant="outline" size="sm" disabled={busy} onClick={close}>
          Cancel
        </Button>
        <Button
          size="sm"
          disabled={busy || !activeScope}
          onClick={() => activeScope && onConfirm(activeScope)}
        >
          {busy ? "Dismissing…" : "Confirm dismissal"}
        </Button>
      </div>
    </AnchoredPopover>
  );
}
