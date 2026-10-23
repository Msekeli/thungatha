"use client";

import { ExternalLink } from "lucide-react";
import type { ReactNode } from "react";

export function JobDetailHeading({
  title,
  employer,
  action,
}: {
  title: string;
  employer: string | null;
  action?: ReactNode;
}) {
  const employerLabel = employer?.trim() || "Employer not listed";
  const initials = (employer?.trim() || title)
    .split(/\\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <div className="th-jobs-redesign-job-head flex min-w-0 items-center gap-3 border-b border-[var(--th-line)] pb-3">
      <div
        aria-hidden="true"
        className="th-jobs-employer-mark th-jobs-detail-logo flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--th-panel-muted)] text-base font-bold text-[var(--th-accent)]"
      >
        {initials}
      </div>
      <div className="th-jobs-redesign-title min-w-0 flex-1">
        <h2 className="m-0 break-words text-[1.0625rem] font-semibold leading-tight sm:text-[1.1875rem]">
          {title}
        </h2>
        <div className="mt-1 flex min-w-0 items-center gap-1 text-xs text-muted">
          <span className="truncate">{employerLabel}</span>
          <ExternalLink
            className="th-jobs-external-mark shrink-0"
            size={13}
            aria-label="External employer link"
          />
        </div>
      </div>
      {action}
    </div>
  );
}
