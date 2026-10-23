import type { ReactNode } from "react";

export function JobOpportunityDetailPanel({
  mobileDetail,
  loading,
  children,
}: {
  mobileDetail: boolean;
  loading: boolean;
  children: ReactNode;
}) {
  return (
    <section
      className={`th-jobs-detail-panel th-jobs-redesign-detail ${mobileDetail ? "th-jobs-mobile-visible" : ""} sticky top-1.5 flex h-full min-h-0 min-w-0 flex-col self-start overflow-y-auto rounded-2xl border border-[var(--th-line)] bg-[var(--th-panel)] p-4 shadow-sm max-h-[calc(100dvh-var(--th-app-header-height,72px)-42px)] [&>.th-jobs-detail-content]:flex [&>.th-jobs-detail-content]:min-h-0 [&>.th-jobs-detail-content]:flex-1 max-[760px]:static max-[760px]:h-auto max-[760px]:max-h-none max-[760px]:p-3 max-[760px]:shadow-none`}
      aria-label="Selected job details"
      aria-busy={loading}
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto max-[760px]:overflow-visible">
        {children}
      </div>
    </section>
  );
}
