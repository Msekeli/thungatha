"use client";

import type { ReactNode } from "react";

export function ProfileAccordion({
  title,
  description,
  status,
  children,
}: {
  title: string;
  description?: string;
  status: string;
  children: ReactNode;
}) {
  return (
    <details className="th-profile-accordion rounded-xl border border-border bg-card text-card-foreground shadow-sm">
      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-4 py-4 sm:px-5 [&::-webkit-details-marker]:hidden">
        <span className="min-w-0">
          <span className="block text-sm font-semibold">{title}</span>
          {description && <span className="mt-1 block text-xs font-normal text-muted-foreground">{description}</span>}
        </span>
        <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">{status}</span>
      </summary>
      <div className="th-profile-accordion-content border-t border-border p-3 sm:p-5">
        {children}
      </div>
    </details>
  );
}
