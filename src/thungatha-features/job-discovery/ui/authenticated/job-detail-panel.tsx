"use client";

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JobDetailActions } from "./job-detail-actions";
import { JobDetailPresentation, JobDetailEmptyState } from "../shared/job-detail-presentation";

type JobSource = {
  id: string; provider_key: string; provider_kind: string; external_job_id: string;
  source_url: string | null; application_url: string | null; published_at: string | null;
  availability_status: string;
};
type Job = {
  id: string; title: string; employer_name: string | null; description: string | null;
  location_text: string | null; country_code: string | null;
  work_mode: "onsite" | "hybrid" | "remote" | "unknown" | null;
  employment_type: string | null; salary_min: number | null; salary_max: number | null;
  salary_currency: string | null; updated_at: string | null;
  job_sources: JobSource[] | JobSource | null; state: "saved" | "dismissed" | null;
};
type Props = {
  job: Job | null; source: JobSource | null; applicationDestination: string | null;
  applicationUrl: string | null; jobSourceUrl: string | null; busy: boolean;
  detailLoading: boolean; mobileDetail: boolean; activityError: string | null;
  detailError: string | null; formatDate: (value: string | null | undefined) => string | null;
  onBack: () => void; onViewMatch: () => void; onApply: () => void;
  onSave: () => void; onDismiss: () => void; onRetry: () => void;
};

export function AuthenticatedJobDetailPanel({
  job, source, applicationDestination, applicationUrl, jobSourceUrl, busy,
  detailLoading, mobileDetail, activityError, detailError, formatDate,
  onBack, onViewMatch, onApply, onSave, onDismiss, onRetry,
}: Props) {
  return (
    <section className={`th-jobs-detail-panel th-jobs-redesign-detail ${mobileDetail ? "th-jobs-mobile-visible" : ""}`}
      aria-label="Selected job details" aria-busy={detailLoading}>
      {!job ? <JobDetailEmptyState /> : (
        <JobDetailPresentation job={job} postedAt={source?.published_at || null} formatDate={formatDate}
          beforeContent={<Button variant="ghost" size="sm" type="button" className="th-jobs-mobile-back" onClick={onBack}>
            <ArrowLeft size={17} aria-hidden="true" /> Back to results
          </Button>}
          headingAction={<div className="th-jobs-match-scorebox">
            <span>Match</span><strong>—</strong>
            <Button variant="ghost" size="sm" onClick={onViewMatch}>View breakdown</Button>
          </div>}
          actions={<>
            <JobDetailActions job={job} applicationDestination={applicationDestination}
              applicationUrl={applicationUrl} jobSourceUrl={jobSourceUrl} busy={busy}
              detailLoading={detailLoading} onApply={onApply} onSave={onSave} onDismiss={onDismiss} />
            {activityError && <p className="th-jobs-state-error" role="status">{activityError}</p>}
            {detailError && <p className="th-jobs-state-error" role="status">
              {detailError} <Button variant="secondary" size="sm" onClick={onRetry}>Retry</Button>
            </p>}
            <div className="th-jobs-source-status">
              <span data-available={Boolean(applicationUrl)}>
                {applicationUrl ? "✓ Application destination available" : "! Employer application link not verified"}
              </span>
            </div>
          </>}
        />
      )}
    </section>
  );
}
