"use client";
import type { RefObject } from "react";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import { Button } from "@/components/ui/button";
import { Bookmark } from "lucide-react";
import { JobList } from "../shared/job-list";
import { JobDiscoveryResultsSummary } from "../shared/job-discovery-results-summary";
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
type Feed = { page: number; totalPages: number; total: number };
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
    <Box component="section"
      className={`th-jobs-results-panel th-jobs-redesign-results ${mobileDetail ? "th-jobs-mobile-hidden" : ""}`}
      aria-label="Job search results" aria-busy={loading}
      sx={{
        minWidth: 0, minHeight: 0, maxHeight: "none", overflowY: "auto",
        p: 1.75, border: 1, borderColor: "divider", borderRadius: 2,
        bgcolor: "background.paper", boxShadow: 1,
        "& .th-jobs-results-head": {
          position: "sticky", top: 0, zIndex: 3, mx: -0.25, mt: -0.25,
          mb: 1.5, px: 0.5, py: 1, borderBottom: 1, borderColor: "divider",
          bgcolor: "background.paper",
        },
        "@media (max-width: 760px)": {
          p: 1.25, borderRadius: 1.75, boxShadow: "none",
          "& .th-jobs-results-head": { position: "static", mx: 0, mt: 0, mb: 1.25, px: 0.25, py: 0.75 },
        },
      }}
    >
      <JobDiscoveryResultsSummary
        label={loading ? "Updating opportunities…" : jobs.length === 0 ? "0 opportunities" : `1–${Math.min(jobs.length, feed?.total ?? jobs.length)} of ${(feed?.total ?? jobs.length).toLocaleString()} opportunities`}
        secondary="Official-source listings"
      />
      {loading && !feed ? (
        <Box role="status" sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 1.25, p: "28px 8px", color: "text.secondary", fontSize: 12 }}>
          <CircularProgress size={20} aria-label="Loading opportunities" />
          <Typography component="strong" sx={{ color: "text.primary", fontSize: 13, fontWeight: 600 }}>Loading opportunities</Typography>
        </Box>
      ) : error ? (
        <Box role="alert" sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 1.25, p: "28px 8px", color: "text.secondary", fontSize: 12 }}>
          <Typography component="strong" sx={{ color: "text.primary", fontSize: 13, fontWeight: 600 }}>We couldn’t load opportunities</Typography>
          <Typography component="p" sx={{ m: 0, mb: 0.5, lineHeight: 1.6 }}>{error}</Typography>
          <Button onClick={onRetry}>Retry</Button>
        </Box>
      ) : jobs.length === 0 ? (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 1.25, p: "28px 8px", color: "text.secondary", fontSize: 12 }}>
          <Typography component="strong" sx={{ color: "text.primary", fontSize: 13, fontWeight: 600 }}>{hasFilters ? "No opportunities match these filters" : "No active opportunities available"}</Typography>
          <Typography component="p" sx={{ m: 0, mb: 0.5, lineHeight: 1.6 }}>Try changing your search or filters.</Typography>
        </Box>
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
            <Box ref={loadMoreRef} aria-live="polite" sx={{ p: "16px 8px", textAlign: "center", color: "text.secondary", fontSize: 12 }}>
              {loading ? "Loading more opportunities…" : "Scroll to load more opportunities"}
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
