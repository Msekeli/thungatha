"use client";

import { Building2, MoreHorizontal } from "lucide-react";
import { ApplicationStatusBadge } from "./application-status-badge";
import type { ApplicationRecord } from "../types/application";

type Props = {
  applications: ApplicationRecord[];
  onOpen: (application: ApplicationRecord) => void;
};

function formatDate(value: string) {
  if (!value) return "Date not set";
  return new Intl.DateTimeFormat("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

export function ApplicationList({ applications, onOpen }: Props) {
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <div className="hidden grid-cols-[minmax(0,2fr)_minmax(130px,1fr)_minmax(120px,1fr)_auto] gap-4 border-b border-border bg-muted/40 px-4 py-3 text-xs font-medium text-muted-foreground md:grid">
        <span>Company and role</span>
        <span>Applied</span>
        <span>Status</span>
        <span className="text-right">Details</span>
      </div>
      <ul className="divide-y divide-border">
        {applications.map((application) => (
          <li key={application.id}>
            <button
              type="button"
              onClick={() => onOpen(application)}
              className="grid w-full grid-cols-1 gap-3 px-4 py-4 text-left transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring md:grid-cols-[minmax(0,2fr)_minmax(130px,1fr)_minmax(120px,1fr)_auto] md:items-center md:gap-4"
            >
              <span className="flex min-w-0 items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <Building2 aria-hidden="true" className="size-5" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-foreground">{application.company}</span>
                  <span className="mt-0.5 block truncate text-sm text-muted-foreground">{application.jobTitle}</span>
                </span>
              </span>
              <span className="text-sm text-muted-foreground">
                <span className="mr-2 text-xs text-muted-foreground md:hidden">Applied:</span>
                {formatDate(application.applicationDate)}
              </span>
              <span><ApplicationStatusBadge status={application.status} /></span>
              <span className="hidden justify-end text-muted-foreground md:flex">
                <MoreHorizontal aria-hidden="true" className="size-5" />
                <span className="sr-only">View application details</span>
              </span>
            </button>
}
          </li>
        ))}
      </ul>
    </div>
  );
}
