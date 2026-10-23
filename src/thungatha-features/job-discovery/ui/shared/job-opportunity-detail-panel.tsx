import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function JobOpportunityDetailPanel({
  mobileDetail,
  onBack,
  loading,
  children,
}: {
  mobileDetail: boolean;
  onBack: () => void;
  loading: boolean;
  children: ReactNode;
}) {
  return (
    <section
      className={`th-jobs-detail-panel th-jobs-redesign-detail ${mobileDetail ? "max-[900px]:flex" : "max-[900px]:hidden"} max-[900px]:order-2 sticky top-1.5 flex h-full min-h-0 min-w-0 flex-col self-start overflow-y-auto rounded-2xl border border-[var(--th-line)] bg-[var(--th-panel)] p-4 shadow-sm max-h-[calc(100dvh-var(--th-app-header-height,72px)-42px)] [&>.th-jobs-detail-content]:flex [&>.th-jobs-detail-content]:min-h-0 [&>.th-jobs-detail-content]:flex-1 max-[900px]:static max-[900px]:h-auto max-[900px]:max-h-none max-[900px]:w-full max-[900px]:self-stretch max-[900px]:p-3 max-[900px]:shadow-none max-[700px]:h-full max-[700px]:rounded-none max-[700px]:border-0 max-[700px]:bg-transparent max-[700px]:p-0`}
      aria-label="Selected job details"
      aria-busy={loading}
    >
      {mobileDetail && (
        <Button
          variant="outline"
          size="sm"
          className="mb-3 self-start min-[901px]:hidden"
          onClick={onBack}
        >
          <ArrowLeft aria-hidden="true" />
          Back to results
        </Button>
      )}
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto max-[900px]:overflow-visible">
        {children}
      </div>
    </section>
  );
}
