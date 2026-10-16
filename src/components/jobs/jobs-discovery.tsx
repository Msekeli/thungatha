"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

type JobSource = {
  id: string;
  provider_key: string;
  provider_kind: string;
  external_job_id: string;
  source_url: string | null;
  application_url: string | null;
  published_at: string | null;
  availability_status: string;
};

type Job = {
  id: string;
  title: string;
  employer_name: string | null;
  description: string | null;
  location_text: string | null;
  country_code: string | null;
  work_mode: "onsite" | "hybrid" | "remote" | "unknown" | null;
  employment_type: string | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string | null;
  updated_at: string | null;
  job_sources: JobSource[] | JobSource | null;
  state: "saved" | "dismissed" | null;
};

type Feed = { jobs: Job[]; page: number; pageSize: number; total: number; totalPages: number };
type Filters = { query: string; location: string; countryCode: string; workMode: string; employmentType: string };
type ApiError = { error?: string; requestId?: string };

const EMPTY_FILTERS: Filters = { query: "", location: "", countryCode: "", workMode: "", employmentType: "" };
const PAGE_SIZE = 25;

function sourceFor(job: Job | null): JobSource | null {
  if (!job?.job_sources) return null;
  return Array.isArray(job.job_sources) ? job.job_sources[0] ?? null : job.job_sources;
}

function sourceLabel(source: JobSource | null): string {
  const key = source?.provider_key?.trim();
  return key ? key.replace(/[_-]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()) : "Source not supplied";
}

function shown(value: string | null | undefined): string {
  return value?.trim() || "Not provided";
}

function formatDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : new Intl.DateTimeFormat(undefined, { year: "numeric", month: "short", day: "numeric" }).format(date);
}

function formatSalary(job: Job): string | null {
  if (job.salary_min == null && job.salary_max == null) return null;
  const money = (amount: number) => `${job.salary_currency ? `${job.salary_currency} ` : ""}${new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(amount)}`;
  if (job.salary_min != null && job.salary_max != null) return `${money(job.salary_min)} – ${money(job.salary_max)}`;
  return job.salary_min != null ? `From ${money(job.salary_min)}` : `Up to ${money(job.salary_max!)}`;
}

async function getApiError(response: Response): Promise<string> {
  let payload: ApiError = {};
  try { payload = (await response.json()) as ApiError; } catch { /* non-JSON error */ }
  if (response.status === 401) return "Your session is no longer available. Sign in again to continue.";
  if (response.status === 503) return payload.error || "Job Discovery is temporarily unavailable. Please retry.";
  if (response.status === 404) return "This listing is no longer available.";
  return payload.error || "The request could not be completed. Please try again.";
}

export default function JobsDiscovery() {
  const [draft, setDraft] = useState<Filters>(EMPTY_FILTERS);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [feed, setFeed] = useState<Feed | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryFeed, setRetryFeed] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<Job | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [retryDetail, setRetryDetail] = useState(0);
  const [mobileDetail, setMobileDetail] = useState(false);

  const params = useMemo(() => {
    const search = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE), state: "all" });
    for (const [key, value] of Object.entries(filters)) if (value.trim()) search.set(key, value.trim());
    return search.toString();
  }, [filters, page]);

  const refreshFeed = useCallback(async (signal: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/jobs?${params}`, { headers: { Accept: "application/json" }, cache: "no-store", signal });
      if (!response.ok) {
        setFeed(null);
        setError(await getApiError(response));
        return;
      }
      const data = (await response.json()) as Feed;
      if (!Array.isArray(data.jobs) || !Number.isFinite(data.totalPages)) {
        setFeed(null);
        setError("The jobs service returned an unexpected response. Please retry.");
        return;
      }
      setFeed(data);
      setSelectedId((current) => current && data.jobs.some((job) => job.id === current) ? current : data.jobs[0]?.id ?? null);
    } catch (reason) {
      if (reason instanceof Error && reason.name === "AbortError") return;
      setFeed(null);
      setError("Could not reach Job Discovery. Check your connection and retry.");
    } finally {
      if (!signal.aborted) setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    const controller = new AbortController();
    void refreshFeed(controller.signal);
    return () => controller.abort();
  }, [refreshFeed, retryFeed]);

  const refreshDetail = useCallback(async (id: string, signal: AbortSignal) => {
    setDetailLoading(true);
    setDetailError(null);
    setDetail(null);
    try {
      const response = await fetch(`/api/jobs/${encodeURIComponent(id)}`, { headers: { Accept: "application/json" }, cache: "no-store", signal });
      if (!response.ok) {
        setDetailError(await getApiError(response));
        return;
      }
      const data = (await response.json()) as { job: Job };
      if (!data.job?.id) {
        setDetailError("The job details service returned an unexpected response. Please retry.");
        return;
      }
      setDetail(data.job);
    } catch (reason) {
      if (reason instanceof Error && reason.name === "AbortError") return;
      setDetailError("Could not load this job's details. Check your connection and retry.");
    } finally {
      if (!signal.aborted) setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      setDetailError(null);
      setDetailLoading(false);
      return;
    }
    const controller = new AbortController();
    void refreshDetail(selectedId, controller.signal);
    return () => controller.abort();
  }, [selectedId, refreshDetail, retryDetail]);

  const submitFilters = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFilters({ ...draft });
    setPage(1);
    setMobileDetail(false);
  };

  const clearFilters = () => {
    setDraft(EMPTY_FILTERS);
    setFilters(EMPTY_FILTERS);
    setPage(1);
    setMobileDetail(false);
  };

  const changeDraft = (key: keyof Filters, value: string) => setDraft((current) => ({ ...current, [key]: value }));
  const resetDisabled = !Object.values(draft).some(Boolean) && !Object.values(filters).some(Boolean);
  const selectedDetail = detail?.id === selectedId ? detail : null;
  const selectedSource = sourceFor(selectedDetail);
  const range = !feed || feed.total === 0 ? "0 jobs" : `${(feed.page - 1) * feed.pageSize + 1}–${Math.min(feed.page * feed.pageSize, feed.total)} of ${feed.total}`;
  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <main className="th-jobs-page">
      <header className="th-jobs-header">
        <div>
          <p className="th-jobs-eyebrow">THUNGATHA / JOBS</p>
          <h1>Job Discovery</h1>
          <p className="th-jobs-subtitle">Explore real opportunities. Inspect the details. Choose your next step.</p>
        </div>
        <div className="th-jobs-header-meta"><span className="th-jobs-live-dot" aria-hidden="true" />Persisted listings</div>
      </header>

      <div className="th-jobs-workspace">
        <aside className="th-jobs-search-panel" aria-label="Search and filter jobs">
          <form onSubmit={submitFilters}>
            <div className="th-jobs-panel-title">
              <div><p className="th-jobs-label">FIND YOUR NEXT ROLE</p><h2>Search jobs</h2></div>
              <span className="th-jobs-filter-icon" aria-hidden="true">⌕</span>
            </div>
            <label className="th-jobs-field">
              <span>Keyword or employer</span>
              <input className="th-input" name="query" maxLength={200} placeholder="e.g. Software Engineer" value={draft.query} onChange={(event) => changeDraft("query", event.target.value)} />
            </label>
            <label className="th-jobs-field">
              <span>Location</span>
              <input className="th-input" name="location" maxLength={200} placeholder="City, province or country" value={draft.location} onChange={(event) => changeDraft("location", event.target.value)} />
            </label>
            <label className="th-jobs-field">
              <span>Country</span>
              <select className="th-input" name="countryCode" value={draft.countryCode} onChange={(event) => changeDraft("countryCode", event.target.value)}>
                <option value="">All countries</option><option value="ZA">South Africa</option>
              </select>
            </label>
            <label className="th-jobs-field">
              <span>Work mode</span>
              <select className="th-input" name="workMode" value={draft.workMode} onChange={(event) => changeDraft("workMode", event.target.value)}>
                <option value="">Any work mode</option><option value="onsite">On-site</option><option value="hybrid">Hybrid</option><option value="remote">Remote</option><option value="unknown">Not specified</option>
              </select>
            </label>
            <label className="th-jobs-field">
              <span>Employment type</span>
              <input className="th-input" name="employmentType" maxLength={100} placeholder="e.g. Full-time, contract" value={draft.employmentType} onChange={(event) => changeDraft("employmentType", event.target.value)} />
            </label>
            <div className="th-jobs-filter-actions">
              <Button type="submit" variant="primary" block>Apply filters</Button>
              <Button type="button" variant="ghost" block onClick={clearFilters} disabled={resetDisabled}>Clear filters</Button>
            </div>
          </form>
          <p className="th-jobs-filter-note">Filters use listing data only. No match score is calculated here.</p>
        </aside>

        <section className={`th-jobs-results-panel ${mobileDetail ? "th-jobs-mobile-hidden" : ""}`} aria-label="Job search results" aria-busy={loading}>
          <div className="th-jobs-results-head">
            <div><p className="th-jobs-label">OPPORTUNITIES</p><h2>Job feed</h2></div>
            <span className="th-jobs-count" aria-live="polite">{loading ? "Updating…" : range}</span>
          </div>

          {loading && !feed ? (
            <div className="th-jobs-state" role="status"><span className="th-jobs-spinner" aria-hidden="true" /><strong>Loading jobs</strong><span>Retrieving persisted listings…</span><div className="th-jobs-skeleton" aria-hidden="true"><i /><i /><i /></div></div>
          ) : error ? (
            <div className="th-jobs-state" role="alert"><span className="th-jobs-state-symbol" aria-hidden="true">!</span><strong>We couldn’t load the job feed</strong><p>{error}</p><Button variant="primary" onClick={() => setRetryFeed((value) => value + 1)}>Retry feed</Button></div>
          ) : feed && feed.jobs.length === 0 ? (
            <div className="th-jobs-state"><span className="th-jobs-state-symbol" aria-hidden="true">⌕</span><strong>{hasFilters ? "No jobs match these filters" : "No active jobs are available"}</strong><p>{hasFilters ? "Try changing the keyword or broadening your filters." : "There are no persisted active listings to show right now. This is not an application error."}</p>{hasFilters && <Button variant="secondary" onClick={clearFilters}>Clear filters</Button>}</div>
          ) : (
            <>
              {feed?.jobs.map((job) => {
                const source = sourceFor(job);
                const selected = job.id === selectedId;
                const posted = formatDate(source?.published_at);
                return (
                  <button key={job.id} type="button" className="th-jobs-card" data-selected={selected} onClick={() => { setSelectedId(job.id); setMobileDetail(true); }} aria-pressed={selected} aria-label={`${job.title}, ${shown(job.employer_name)}, ${shown(job.location_text)}`}>
                    <div className="th-jobs-card-top">
                      <span className="th-jobs-employer-mark" aria-hidden="true">{(job.employer_name?.trim() || "?").slice(0, 1).toUpperCase()}</span>
                      <span className="th-jobs-card-source">{sourceLabel(source)}</span>
                      {job.state === "saved" && <span className="th-tag" data-tone="success">Saved</span>}
                    </div>
                    <h3>{job.title}</h3><p className="th-jobs-employer">{shown(job.employer_name)}</p>
                    <div className="th-jobs-card-meta">
                      <span><span aria-hidden="true">⌖</span> {shown(job.location_text)}</span>
                      {job.work_mode && job.work_mode !== "unknown" && <span>{job.work_mode === "onsite" ? "On-site" : job.work_mode === "hybrid" ? "Hybrid" : "Remote"}</span>}
                      {job.employment_type && <span>{job.employment_type}</span>}
                    </div>
                    <div className="th-jobs-card-foot"><span>{posted ? `Listed ${posted}` : "Listing date not provided"}</span><span className="th-jobs-open-label">View details <span aria-hidden="true">↗</span></span></div>
                  </button>
                );
              })}
              {feed && feed.totalPages > 1 && <nav className="th-jobs-pagination" aria-label="Job results pages"><Button variant="secondary" size="sm" disabled={feed.page <= 1 || loading} onClick={() => setPage((value) => Math.max(1, value - 1))}>Previous</Button><span>Page {feed.page} of {feed.totalPages}</span><Button variant="secondary" size="sm" disabled={feed.page >= feed.totalPages || loading} onClick={() => setPage((value) => Math.min(feed.totalPages, value + 1))}>Next</Button></nav>}
            </>
          )}
        </section>

        <section className={`th-jobs-detail-panel ${mobileDetail ? "th-jobs-mobile-visible" : ""}`} aria-label="Selected job details" aria-busy={detailLoading}>
          <div className="th-jobs-detail-head"><div><p className="th-jobs-label">ROLE OVERVIEW</p><h2>Job details</h2></div><button className="th-jobs-detail-close" type="button" onClick={() => setMobileDetail(false)} aria-label="Back to results">← Back</button></div>
          {!selectedId ? (
            <div className="th-jobs-detail-placeholder"><span aria-hidden="true">↖</span><strong>Select a job to inspect it</strong><p>Choose a listing from the feed to see full details and source links.</p></div>
          ) : detailLoading ? (
            <div className="th-jobs-detail-placeholder" role="status"><span className="th-jobs-spinner" aria-hidden="true" /><strong>Loading job details</strong><p>Fetching the latest listing from the job service…</p></div>
          ) : detailError ? (
            <div className="th-jobs-detail-placeholder" role="alert"><span className="th-jobs-state-symbol" aria-hidden="true">!</span><strong>Details are unavailable</strong><p>{detailError}</p><Button variant="secondary" onClick={() => setRetryDetail((value) => value + 1)}>Retry details</Button></div>
          ) : selectedDetail ? (
            <div className="th-jobs-detail-content" key={selectedDetail.id}>
              <div className="th-jobs-detail-brand"><span className="th-jobs-employer-mark th-jobs-employer-mark-large" aria-hidden="true">{(selectedDetail.employer_name?.trim() || "?").slice(0, 1).toUpperCase()}</span><div><h3>{selectedDetail.title}</h3><p>{shown(selectedDetail.employer_name)}</p></div></div>
              <div className="th-jobs-detail-tags">{selectedDetail.work_mode && selectedDetail.work_mode !== "unknown" && <span className="th-tag" data-tone="accent">{selectedDetail.work_mode === "onsite" ? "On-site" : selectedDetail.work_mode === "hybrid" ? "Hybrid" : "Remote"}</span>}{selectedDetail.employment_type && <span className="th-tag">{selectedDetail.employment_type}</span>}{selectedDetail.country_code && <span className="th-tag">{selectedDetail.country_code}</span>}</div>
              <dl className="th-jobs-facts"><div><dt>Location</dt><dd>{shown(selectedDetail.location_text)}</dd></div>{formatSalary(selectedDetail) && <div><dt>Salary</dt><dd>{formatSalary(selectedDetail)}</dd></div>}<div><dt>Published</dt><dd>{formatDate(selectedSource?.published_at) ?? "Date not provided"}</dd></div><div><dt>Last updated</dt><dd>{formatDate(selectedDetail.updated_at) ?? "Date not provided"}</dd></div></dl>
              <div className="th-jobs-description"><h4>Job description</h4>{selectedDetail.description?.trim() ? <p>{selectedDetail.description}</p> : <p className="th-jobs-muted">The source did not provide a job description.</p>}</div>
              <div className="th-jobs-source-block"><p className="th-jobs-label">DISCOVERY SOURCE</p><strong>{sourceLabel(selectedSource)}</strong>{selectedSource?.source_url ? <a href={selectedSource.source_url} target="_blank" rel="noopener noreferrer">View original listing <span aria-hidden="true">↗</span></a> : <span className="th-jobs-muted">Original source URL not available</span>}</div>
              <div className="th-jobs-application-block"><p className="th-jobs-label">APPLICATION DESTINATION</p>{selectedSource?.application_url ? <><a className="th-jobs-apply-link" href={selectedSource.application_url} target="_blank" rel="noopener noreferrer">Open job application page <span aria-hidden="true">↗</span></a><p>Opens the external website. Thungatha does not submit an application.</p></> : <p className="th-jobs-muted">An application destination was not supplied for this listing.</p>}</div>
              <div className="th-jobs-detail-actions"><Button variant="secondary" onClick={() => { if (selectedSource?.source_url) window.open(selectedSource.source_url, "_blank", "noopener,noreferrer"); }} disabled={!selectedSource?.source_url}>Open job page</Button><Button variant="ghost" className="th-jobs-desktop-back" onClick={() => setMobileDetail(false)}>Back to results</Button></div>
              <p className="th-jobs-integrity-note">No fit score or application status is shown unless the corresponding feature supplies a verified record.</p>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
