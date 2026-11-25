"use client";

import { useEffect, useState } from "react";
import { AnchoredPopover } from "@/components/ui/anchored-popover";
import type { Job } from "../job-discovery-utils";
import { JobDismissalFooter } from "./job-dismissal-footer";
import { JobDismissalHeader } from "./job-dismissal-header";
import { JobDismissalOption, type DismissalScope } from "./job-dismissal-option";

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
  const [selectedScope, setSelectedScope] = useState<DismissalScope | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const employer = job?.employer_name?.trim() || "this employer";
  const activeScope = selectedJobId === job?.id ? selectedScope : null;

  useEffect(() => {
    queueMicrotask(() => {
      if (!job) return setAnchor(null);
      const activeElement = document.activeElement;
      setAnchor(activeElement instanceof HTMLElement ? activeElement : null);
    });
  }, [job]);

  const close = () => {
    setSelectedJobId(null);
    setSelectedScope(null);
    onClose();
  };
  const select = (scope: DismissalScope) => {
    setSelectedJobId(job?.id ?? null);
    setSelectedScope(scope);
  };

  return (
    <AnchoredPopover
      open={Boolean(job)}
      anchor={anchor}
      onClose={close}
      label="Dismiss job options"
      className="relative w-[min(400px,calc(100vw-24px))] rounded-xl border border-line bg-panel p-4 text-fg shadow-xl"
    >
      <JobDismissalHeader busy={busy} onClose={close} />
      <div className="mt-4 grid gap-2" role="radiogroup" aria-label="Dismissal scope">
        <JobDismissalOption
          selected={activeScope === "job"}
          disabled={busy || !job}
          title="Dismiss this job only"
          description={`Hide “${job?.title ?? "this vacancy"}”. Other jobs from ${employer} may still appear.`}
          onSelect={() => select("job")}
        />
        <JobDismissalOption
          selected={activeScope === "employer"}
          disabled={busy || !job || !job.employer_name?.trim()}
          title={`Dismiss ${employer}`}
          description="Hide all current and future jobs from this employer."
          onSelect={() => select("employer")}
        />
      </div>
      <JobDismissalFooter activeScope={activeScope} busy={busy} onClose={close} onConfirm={onConfirm} />
    </AnchoredPopover>
  );
}
