"use client";

import type { RefObject } from "react";
import { Button } from "@/components/ui/button";
import { Bookmark } from "lucide-react";
import { JobList } from "../shared/job-list";

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
type Feed = { page: number; totalPages: number };
type Props = {
  jobs: Job[]; feed: Feed | null; loading: boolean; error: string | null;
  hasFilters: boolean; mobileDetail: boolean; selectedId: string | null;
  loadMoreRef: RefObject<HTMLDivElement | null>;
  sourceFor: (job: Job | null) => JobSource | null;
  formatDate: (value: string | null | undefined) => string | null;
  onRetry: () => void; onSelect: (job: Job) => void; onSave: (job: Job) => void;
};

export function AuthenticatedJobResultsPanel({
  jobs, feed, loading, error, hasFilters, mobileDetail, selectedId,
  loadMoreRef, sourceFor, formatDate, onRetry, onSelect, onSave,
}: Props) {
  return (
    <section
      className={`th-jobs-results-panel th-jobs-redesign-results ${mobileDetail ? "th-jobs-mobile-hidden" : ""}`}
      aria-label="Job search results" aria-busy={loading}
    >
      <div className="th-jobs-results-head">
        <span>{loading ? "Updating…" : `${jobs.length ? "Showing " : ""}${jobs.length} opportunities`}</span>
        <span className="th-jobs-label">Official-source listings</span>
      </div>
      {loading && !feed ? (
        <div className="th-jobs-state" role="status">
          <span className="th-jobs-spinner" aria-hidden="true" />
          <strong>Loading opportunities</strong>
        </div>
      ) : error ? (
        <div className="th-jobs-state" role="alert">
          <strong>We couldn’t load opportunities</strong><p>{error}</p>
          <Button onClick={onRetry}>Retry</Button>
        </div>
      ) : jobs.length === 0 ? (
        <div className="th-jobs-state">
          <strong>{hasFilters ? "No opportunities match these filters" : "No active opportunities available"}</strong>
          <p>Try changing your search or filters.</p>
        </div>
      ) : (
        <>
          <JobList jobs={jobs} variant="authenticated" selectedId={selectedId}
            postedLabel={(job) => {
              const source = sourceFor(job as Job);
              return source?.published_at ? formatDate(source.published_at) || "Date unknown" : "Date unknown";
            }}
            onSelect={(job) => onSelect(job as Job)}
            saveAction={(job) => {
              const fullJob = jobs.find((item) => item.id === job.id)!;
              return <Button variant="ghost" size="sm" type="button"
                aria-label={fullJob.state === "saved" ? `Unsave ${fullJob.title}` : `Save ${fullJob.title}`}
                title={fullJob.state === "saved" ? "Remove from saved jobs" : "Save job"}
                onClick={() => onSave(fullJob)}>
                <Bookmark size={16} fill={fullJob.state === "saved" ? "currentColor" : "none"} />
              </Button>;
            }} />
          {feed && feed.page < feed.totalPages && (
            <div ref={loadMoreRef} className="th-jobs-load-more" aria-live="polite">
              {loading ? "Loading more opportunities…" : "Scroll to load more opportunities"}
            </div>
          )}
        </>
      )}
    </section>
  );
}
