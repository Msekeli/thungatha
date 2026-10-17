"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import "./jobs-discovery.css";
import { Button } from "@/components/ui/button";
import { WorkspaceShell } from "@/components/layout/workspace-shell";

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

type JobActivity = {
  application_link_opened_at: string | null;
  applied_at: string | null;
};

type Feed = {
  jobs: Job[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};
type Filters = {
  query: string;
  location: string;
  workMode: string;
  employmentType: string;
  publishedWithin: string;
};
type ApiError = { error?: string; requestId?: string };

const EMPTY_FILTERS: Filters = {
  query: "",
  location: "",
  workMode: "",
  employmentType: "",
  publishedWithin: "30d",
};
const PAGE_SIZE = 25;

function sourceFor(job: Job | null): JobSource | null {
  if (!job?.job_sources) return null;
  return Array.isArray(job.job_sources)
    ? (job.job_sources[0] ?? null)
    : job.job_sources;
}

function sourceLabel(source: JobSource | null): string {
  const key = source?.provider_key?.trim();
  return key
    ? key
        .replace(/[_-]+/g, " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase())
    : "Source not supplied";
}

function shown(value: string | null | undefined): string {
  return value?.trim() || "Not provided";
}

function safeExternalUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

function formatDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? null
    : new Intl.DateTimeFormat(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(date);
}

function formatSalary(job: Job): string | null {
  if (job.salary_min == null && job.salary_max == null) return null;
  const money = (amount: number) =>
    `${job.salary_currency ? `${job.salary_currency} ` : ""}${new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(amount)}`;
  if (job.salary_min != null && job.salary_max != null)
    return `${money(job.salary_min)} – ${money(job.salary_max)}`;
  return job.salary_min != null
    ? `From ${money(job.salary_min)}`
    : `Up to ${money(job.salary_max!)}`;
}

async function getApiError(response: Response): Promise<string> {
  let payload: ApiError = {};
  try {
    payload = (await response.json()) as ApiError;
  } catch {
    /* non-JSON error */
  }
  if (response.status === 401)
    return "Your session is no longer available. Sign in again to continue.";
  if (response.status === 503)
    return (
      payload.error || "Job Discovery is temporarily unavailable. Please retry."
    );
  if (response.status === 404) return "This listing is no longer available.";
  return (
    payload.error || "The request could not be completed. Please try again."
  );
}

export default function JobsDiscovery({ configured }: { configured: boolean }) {
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
  const [category, setCategory] = useState("new");
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [stateBusy, setStateBusy] = useState(false);
  const [stateError, setStateError] = useState<string | null>(null);
  const [stateMessage, setStateMessage] = useState<string | null>(null);
  const [undoAction, setUndoAction] = useState<{ jobId: string; title: string; previousState: "saved" | "dismissed" | null; nextState: "saved" | "dismissed" | null } | null>(null);
  const [jobActivity, setJobActivity] = useState<{ jobId: string; activity: JobActivity } | null>(null);
  const [activityError, setActivityError] = useState<string | null>(null);
  const [promptDismissedForJobId, setPromptDismissedForJobId] = useState<string | null>(null);
  const [forceAppliedPrompt, setForceAppliedPrompt] = useState(false);

  const params = useMemo(() => {
    const search = new URLSearchParams({
      page: String(page),
      pageSize: String(PAGE_SIZE),
      state:
        category === "saved" || category === "dismissed" ? category : "all",
    });
    for (const [key, value] of Object.entries(filters))
      if (value.trim()) search.set(key, value.trim());
    return search.toString();
  }, [filters, page, category]);

  const refreshFeed = useCallback(
    async (signal: AbortSignal) => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/jobs?${params}`, {
          headers: { Accept: "application/json" },
          cache: "no-store",
          signal,
        });
        if (!response.ok) {
          setFeed(null);
          setError(await getApiError(response));
          setIsAuthenticated(response.status !== 401);
          return;
        }
        setIsAuthenticated(true);
        const data = (await response.json()) as Feed;
        if (
          !Array.isArray(data.jobs) ||
          !Number.isInteger(data.page) ||
          data.page < 1 ||
          !Number.isInteger(data.pageSize) ||
          data.pageSize < 1 ||
          !Number.isInteger(data.total) ||
          data.total < 0 ||
          !Number.isInteger(data.totalPages) ||
          data.totalPages < 0 ||
          data.totalPages !== Math.ceil(data.total / data.pageSize) ||
          data.jobs.some(
            (job) =>
              !job ||
              typeof job.id !== "string" ||
              typeof job.title !== "string",
          )
        ) {
          setFeed(null);
          setError(
            "The jobs service returned an unexpected response. Please retry.",
          );
          return;
        }
        setFeed(data);
        setSelectedId((current) =>
          current && data.jobs.some((job) => job.id === current)
            ? current
            : (data.jobs[0]?.id ?? null),
        );
      } catch (reason) {
        if (reason instanceof Error && reason.name === "AbortError") return;
        setFeed(null);
        setError(
          "Could not reach Job Discovery. Check your connection and retry.",
        );
      } finally {
        if (!signal.aborted) setLoading(false);
      }
    },
    [params],
  );

  useEffect(() => {
    const controller = new AbortController();
    void Promise.resolve().then(() => refreshFeed(controller.signal));
    return () => controller.abort();
  }, [refreshFeed, retryFeed]);

  const refreshDetail = useCallback(async (id: string, signal: AbortSignal) => {
    setDetailLoading(true);
    setDetailError(null);
    setDetail(null);
    try {
      const response = await fetch(`/api/jobs/${encodeURIComponent(id)}`, {
        headers: { Accept: "application/json" },
        cache: "no-store",
        signal,
      });
      if (!response.ok) {
        setDetailError(await getApiError(response));
        return;
      }
      const data = (await response.json()) as { job: Job };
      if (!data.job?.id) {
        setDetailError(
          "The job details service returned an unexpected response. Please retry.",
        );
        return;
      }
      setDetail(data.job);
    } catch (reason) {
      if (reason instanceof Error && reason.name === "AbortError") return;
      setDetailError(
        "Could not load this job's details. Check your connection and retry.",
      );
    } finally {
      if (!signal.aborted) setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    const controller = new AbortController();
    void Promise.resolve().then(() =>
      refreshDetail(selectedId, controller.signal),
    );
    return () => controller.abort();
  }, [selectedId, refreshDetail, retryDetail]);

  useEffect(() => {
    if (!selectedId) return;
    const jobId = selectedId;
    const controller = new AbortController();
    void fetch(`/api/jobs/${encodeURIComponent(jobId)}/activity`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: controller.signal,
    }).then(async (response) => {
      if (!response.ok) throw new Error(await getApiError(response));
      const payload = (await response.json()) as { activity?: JobActivity };
      if (!payload.activity) throw new Error("Unexpected activity response");
      setActivityError(null);
      setJobActivity({ jobId, activity: payload.activity });
    }).catch((reason) => {
      if (reason instanceof Error && reason.name === "AbortError") return;
      setActivityError("Application activity could not be loaded.");
    });
    return () => controller.abort();
  }, [selectedId]);

  const updateJobState = useCallback(
    async (
      job: Job,
      nextState: "saved" | "dismissed" | null,
      recordUndo = true,
    ): Promise<boolean> => {
      if (stateBusy) return false;
      const previousState = job.state ?? null;
      setStateBusy(true);
      setStateError(null);
      setStateMessage(null);
      try {
        const response = await fetch(
          "/api/jobs/" + encodeURIComponent(job.id) + "/state",
          {
            method: nextState ? "PUT" : "DELETE",
            headers: {
              Accept: "application/json",
              ...(nextState ? { "Content-Type": "application/json" } : {}),
            },
            ...(nextState ? { body: JSON.stringify({ state: nextState }) } : {}),
            cache: "no-store",
          },
        );
        if (!response.ok) {
          setStateError(await getApiError(response));
          return false;
        }

        setFeed((current) =>
          current
            ? {
                ...current,
                jobs: current.jobs.map((item) =>
                  item.id === job.id ? { ...item, state: nextState } : item,
                ),
              }
            : current,
        );
        setDetail((current) =>
          current?.id === job.id ? { ...current, state: nextState } : current,
        );
        if (recordUndo) {
          setUndoAction({
            jobId: job.id,
            title: job.title,
            previousState,
            nextState,
          });
        }
        setRetryFeed((value) => value + 1);
        return true;
      } catch {
        setStateError(
          "Could not update this job decision. Check your connection and try again.",
        );
        return false;
      } finally {
        setStateBusy(false);
      }
    },
    [stateBusy],
  );

  const undoLastStateChange = async () => {
    if (!undoAction || stateBusy) return;
    const existingJob =
      detail?.id === undoAction.jobId
        ? detail
        : feed?.jobs.find((item) => item.id === undoAction.jobId);
    const job: Job = {
      ...(existingJob ?? {
        id: undoAction.jobId,
        title: undoAction.title,
        employer_name: null,
        description: null,
        location_text: null,
        country_code: null,
        work_mode: null,
        employment_type: null,
        salary_min: null,
        salary_max: null,
        salary_currency: null,
        updated_at: null,
        job_sources: null,
        state: undoAction.nextState,
      }),
      state: undoAction.nextState,
    };
    const restored = await updateJobState(job, undoAction.previousState, false);
    if (restored) {
      setUndoAction(null);
      setStateMessage(
        undoAction.previousState === "saved"
          ? "Previous saved state restored."
          : undoAction.previousState === "dismissed"
            ? "Previous dismissed state restored."
            : "Job decision undone.",
      );
    }
  };

  useEffect(() => {
    if (!undoAction) return;
    const timeoutId = window.setTimeout(() => setUndoAction(null), 10_000);
    return () => window.clearTimeout(timeoutId);
  }, [undoAction]);

  const openApplicationLink = (job: Job, url: string) => {
    // Open synchronously from the click so the browser does not block the new tab.
    window.open(url, "_blank", "noopener,noreferrer");
    // The prompt should be waiting when the user returns from the external site.
    // Do not mark it dismissed merely because the application link was opened.
    setPromptDismissedForJobId(null);
    setForceAppliedPrompt(false);
    setStateError(null);
    void fetch(`/api/jobs/${encodeURIComponent(job.id)}/activity`, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ action: "opened_application" }),
      cache: "no-store",
    }).then(async (response) => {
      if (!response.ok) throw new Error(await getApiError(response));
      const payload = (await response.json()) as { activity: JobActivity };
      setJobActivity({ jobId: job.id, activity: payload.activity });
    }).catch(() => {
      setStateError("The application page opened, but Thungatha could not record that visit.");
    });
  };

  const confirmApplied = async () => {
    if (!selectedDetail || stateBusy) return;
    setStateBusy(true);
    setStateError(null);
    try {
      const response = await fetch(`/api/jobs/${encodeURIComponent(selectedDetail.id)}/activity`, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ action: "confirm_applied" }),
        cache: "no-store",
      });
      if (!response.ok) {
        setStateError(await getApiError(response));
        return;
      }
      const payload = (await response.json()) as { activity: JobActivity };
      setJobActivity({ jobId: selectedDetail.id, activity: payload.activity });
      setForceAppliedPrompt(false);
      setPromptDismissedForJobId(selectedDetail.id);
      setStateMessage("Application confirmation recorded.");
      setRetryFeed((value) => value + 1);
    } catch {
      setStateError("Could not record your application confirmation. Please try again.");
    } finally {
      setStateBusy(false);
    }
  };

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

  const changeDraft = (key: keyof Filters, value: string) =>
    setDraft((current) => ({ ...current, [key]: value }));
  const resetDisabled =
    JSON.stringify(draft) === JSON.stringify(EMPTY_FILTERS) &&
    JSON.stringify(filters) === JSON.stringify(EMPTY_FILTERS);
  const selectedDetail =
    detail?.id === selectedId
      ? detail
      : (feed?.jobs.find((job) => job.id === selectedId) ?? null);
  const selectedSource = sourceFor(selectedDetail);
  const selectedActivity = jobActivity?.jobId === selectedId ? jobActivity.activity : null;
  const sourceUrl = safeExternalUrl(selectedSource?.source_url);
  const applicationUrl = safeExternalUrl(selectedSource?.application_url);
  const range =
    !feed || feed.total === 0
      ? "0 jobs"
      : `${(feed.page - 1) * feed.pageSize + 1}–${Math.min(feed.page * feed.pageSize, feed.total)} of ${feed.total}`;
  const hasFilters = Object.entries(filters).some(([key, value]) =>
    key === "publishedWithin" ? value !== "30d" : Boolean(value),
  );

  return (
    <WorkspaceShell active="/jobs" configured={configured}>
      <main className="th-jobs-page">
        {!isAuthenticated && (
          <div className="th-jobs-auth-notice" role="status">
            <p>
              Your session has expired. Sign in again to browse job listings.
            </p>
            <Link href="/sign-in">Go to sign in</Link>
          </div>
        )}
        <header className="th-jobs-header">
          <div>
            <p className="th-jobs-eyebrow">THUNGATHA / JOBS</p>
            <h1>Job Discovery</h1>
            <p className="th-jobs-subtitle">
              Explore real opportunities. Inspect the details. Choose your next
              step.
            </p>
          </div>
          <div className="th-jobs-header-meta">
            <span className="th-jobs-live-dot" aria-hidden="true" />
            Persisted listings
          </div>
        </header>

        {undoAction && (
          <div className="th-jobs-undo-snackbar" role="status" aria-live="polite">
            <span>
              {undoAction.nextState === "saved" ? (
                <>{undoAction.title} saved.</>
              ) : undoAction.nextState === "dismissed" ? (
                <>{undoAction.title} dismissed.</>
              ) : (
                <>{undoAction.title} decision updated.</>
              )}
            </span>
            <Button
              variant="secondary"
              disabled={stateBusy}
              onClick={() => void undoLastStateChange()}
            >
              Undo
            </Button>
            <button
              className="th-jobs-notice-close"
              type="button"
              aria-label="Dismiss undo notice"
              onClick={() => setUndoAction(null)}
            >
              ×
            </button>
          </div>
        )}
        {stateMessage && !undoAction && (
          <p className="th-jobs-state-message" role="status">{stateMessage}</p>
        )}
        {stateError && (
          <p className="th-jobs-state-error" role="alert">{stateError}</p>
        )}

        <div className="th-jobs-workspace">
          <div className="th-jobs-feed-column">
            <aside
              className="th-jobs-search-panel"
              aria-label="Search and filter jobs"
            >
              <form onSubmit={submitFilters}>
                <div className="th-jobs-panel-title">
                  <div>
                    <p className="th-jobs-label">FIND YOUR NEXT ROLE</p>
                    <h2>Search jobs</h2>
                  </div>
                  <span className="th-jobs-filter-icon" aria-hidden="true">
                    ⌕
                  </span>
                </div>
                <label className="th-jobs-field">
                  <span>Keyword or employer</span>
                  <input
                    className="th-input"
                    name="query"
                    maxLength={200}
                    placeholder="e.g. Software Engineer"
                    value={draft.query}
                    onChange={(event) =>
                      changeDraft("query", event.target.value)
                    }
                  />
                </label>
                <div
                  className="th-jobs-category-tabs"
                  role="group"
                  aria-label="Job categories"
                >
                  {(["new", "saved", "applied", "dismissed"] as const).map(
                    (item) => (
                      <button
                        key={item}
                        type="button"
                        className="th-jobs-category-tab"
                        data-active={category === item}
                        disabled={item === "applied"}
                        title={
                          item === "applied"
                            ? "Application tracking is introduced in a later milestone"
                            : undefined
                        }
                        onClick={() => {
                          setCategory(item);
                          setPage(1);
                          setMobileDetail(false);
                        }}
                      >
                        {item === "new"
                          ? "New"
                          : item === "saved"
                            ? "Saved"
                            : item === "applied"
                              ? "Applied"
                              : "Dismissed"}
                      </button>
                    ),
                  )}
                </div>
                <label className="th-jobs-field">
                  <span>Location</span>
                  <input
                    className="th-input"
                    name="location"
                    maxLength={200}
                    placeholder="City, province or country"
                    value={draft.location}
                    onChange={(event) =>
                      changeDraft("location", event.target.value)
                    }
                  />
                </label>
                <label className="th-jobs-field">
                  <span>Work mode</span>
                  <select
                    className="th-input"
                    name="workMode"
                    value={draft.workMode}
                    onChange={(event) =>
                      changeDraft("workMode", event.target.value)
                    }
                  >
                    <option value="">Any work mode</option>
                    <option value="onsite">On-site</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="remote">Remote</option>
                    <option value="unknown">Not specified</option>
                  </select>
                </label>
                <label className="th-jobs-field">
                  <span>Posted within</span>
                  <select
                    className="th-input"
                    name="publishedWithin"
                    value={draft.publishedWithin}
                    onChange={(event) =>
                      changeDraft("publishedWithin", event.target.value)
                    }
                  >
                    <option value="24h">Last 24 hours</option>
                    <option value="7d">Last 7 days</option>
                    <option value="14d">Last 14 days</option>
                    <option value="30d">Last 30 days</option>
                  </select>
                </label>
                <label className="th-jobs-field">
                  <span>Employment type</span>
                  <input
                    className="th-input"
                    name="employmentType"
                    maxLength={100}
                    placeholder="e.g. Full-time"
                    value={draft.employmentType}
                    onChange={(event) =>
                      changeDraft("employmentType", event.target.value)
                    }
                  />
                </label>
                <div className="th-jobs-filter-actions">
                  <Button type="submit" variant="primary" block>
                    Apply filters
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    block
                    onClick={clearFilters}
                    disabled={resetDisabled}
                  >
                    Clear filters
                  </Button>
                </div>
              </form>
              <p className="th-jobs-filter-note">
                Only listings published within the selected period are shown.
                Listings without a publication date are excluded. No match score
                is calculated here.
              </p>
            </aside>

            <section
              className={`th-jobs-results-panel ${mobileDetail ? "th-jobs-mobile-hidden" : ""}`}
              aria-label="Job search results"
              aria-busy={loading}
            >
              <div className="th-jobs-results-head">
                <div>
                  <p className="th-jobs-label">OPPORTUNITIES</p>
                  <h2>Job feed</h2>
                </div>
                <span className="th-jobs-count" aria-live="polite">
                  {loading ? "Updating…" : range}
                </span>
              </div>

              {loading && !feed ? (
                <div className="th-jobs-state" role="status">
                  <span className="th-jobs-spinner" aria-hidden="true" />
                  <strong>Loading jobs</strong>
                  <span>Retrieving persisted listings…</span>
                  <div className="th-jobs-skeleton" aria-hidden="true">
                    <i />
                    <i />
                    <i />
                  </div>
                </div>
              ) : error ? (
                <div className="th-jobs-state" role="alert">
                  <span className="th-jobs-state-symbol" aria-hidden="true">
                    !
                  </span>
                  <strong>We couldn’t load the job feed</strong>
                  <p>{error}</p>
                  <Button
                    variant="primary"
                    onClick={() => setRetryFeed((value) => value + 1)}
                  >
                    Retry feed
                  </Button>
                </div>
              ) : feed && feed.jobs.length === 0 ? (
                <div className="th-jobs-state">
                  <span className="th-jobs-state-symbol" aria-hidden="true">
                    ⌕
                  </span>
                  <strong>
                    {hasFilters
                      ? "No jobs match these filters"
                      : "No active jobs are available"}
                  </strong>
                  <p>
                    {hasFilters
                      ? "Try changing the keyword or broadening your filters."
                      : "There are no persisted active listings to show right now. This is not an application error."}
                  </p>
                  {hasFilters && (
                    <Button variant="secondary" onClick={clearFilters}>
                      Clear filters
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  {feed?.jobs.map((job) => {
                    const source = sourceFor(job);
                    const selected = job.id === selectedId;
                    const posted = formatDate(source?.published_at);
                    return (
                      <button
                        key={job.id}
                        type="button"
                        className="th-jobs-card"
                        data-selected={selected}
                        onClick={() => {
                          setSelectedId(job.id);
                          setPromptDismissedForJobId(null);
                          setForceAppliedPrompt(false);
                          setActivityError(null);
                          setMobileDetail(true);
                        }}
                        aria-pressed={selected}
                        aria-label={`${job.title}, ${shown(job.employer_name)}, ${shown(job.location_text)}`}
                      >
                        <div className="th-jobs-card-top">
                          <span
                            className="th-jobs-employer-mark"
                            aria-hidden="true"
                          >
                            {(job.employer_name?.trim() || "?")
                              .slice(0, 1)
                              .toUpperCase()}
                          </span>
                          <span className="th-jobs-card-source">
                            {sourceLabel(source)}
                          </span>
                          {job.state === "saved" && (
                            <span className="th-tag" data-tone="success">Saved</span>
                          )}
                          {job.state === "dismissed" && (
                            <span className="th-tag">Dismissed</span>
                          )}
                        </div>
                        <h3>{job.title}</h3>
                        <p className="th-jobs-employer">
                          {shown(job.employer_name)}
                        </p>
                        <div className="th-jobs-card-meta">
                          <span>
                            <span aria-hidden="true">⌖</span>{" "}
                            {shown(job.location_text)}
                          </span>
                          {job.work_mode && job.work_mode !== "unknown" && (
                            <span>
                              {job.work_mode === "onsite"
                                ? "On-site"
                                : job.work_mode === "hybrid"
                                  ? "Hybrid"
                                  : "Remote"}
                            </span>
                          )}
                          {job.employment_type && (
                            <span>{job.employment_type}</span>
                          )}
                        </div>
                        <div className="th-jobs-card-foot">
                          <span>
                            {posted
                              ? `Listed ${posted}`
                              : "Listing date not provided"}
                          </span>
                          <span className="th-jobs-open-label">
                            View details <span aria-hidden="true">↗</span>
                          </span>
                        </div>
                      </button>
                    );
                  })}
                  {feed && feed.totalPages > 1 && (
                    <nav
                      className="th-jobs-pagination"
                      aria-label="Job results pages"
                    >
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={feed.page <= 1 || loading}
                        onClick={() =>
                          setPage((value) => Math.max(1, value - 1))
                        }
                      >
                        Previous
                      </Button>
                      <span>
                        Page {feed.page} of {feed.totalPages}
                      </span>
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={feed.page >= feed.totalPages || loading}
                        onClick={() =>
                          setPage((value) =>
                            Math.min(feed.totalPages, value + 1),
                          )
                        }
                      >
                        Next
                      </Button>
                    </nav>
                  )}
                </>
              )}
            </section>
          </div>

          <section
            className={`th-jobs-detail-panel ${mobileDetail ? "th-jobs-mobile-visible" : ""}`}
            aria-label="Selected job details"
            aria-busy={detailLoading}
          >
            <div className="th-jobs-detail-head">
              <div>
                <p className="th-jobs-label">ROLE OVERVIEW</p>
                <h2>Job details</h2>
              </div>
              <button
                className="th-jobs-detail-close"
                type="button"
                onClick={() => {
                  setMobileDetail(false);
                  setForceAppliedPrompt(false);
                }}
                aria-label="Back to results"
              >
                ← Back to results
              </button>
            </div>
            {selectedDetail && (
              <Button
                className="th-jobs-dismiss-floating"
                variant="secondary"
                disabled={stateBusy || detailLoading}
                onClick={() =>
                  void updateJobState(
                    selectedDetail,
                    selectedDetail.state === "dismissed" ? null : "dismissed",
                  )
                }
                aria-label={selectedDetail.state === "dismissed" ? "Restore job to feed" : "Dismiss job"}
              >
                {selectedDetail.state === "dismissed" ? "↶ Restore" : "× Dismiss"}
              </Button>
            )}
            {!selectedId ? (
              <div className="th-jobs-detail-placeholder">
                <span aria-hidden="true">↖</span>
                <strong>Select a job to inspect it</strong>
                <p>
                  Choose a listing from the feed to see full details and source
                  links.
                </p>
              </div>
            ) : detailLoading && !selectedDetail ? (
              <div className="th-jobs-detail-placeholder" role="status">
                <span className="th-jobs-spinner" aria-hidden="true" />
                <strong>Loading job details</strong>
                <p>Fetching the latest listing from the job service…</p>
              </div>
            ) : detailError && !selectedDetail ? (
              <div className="th-jobs-detail-placeholder" role="alert">
                <span className="th-jobs-state-symbol" aria-hidden="true">
                  !
                </span>
                <strong>Details are unavailable</strong>
                <p>{detailError}</p>
                <Button
                  variant="secondary"
                  onClick={() => setRetryDetail((value) => value + 1)}
                >
                  Retry details
                </Button>
              </div>
            ) : selectedDetail ? (
              <div className="th-jobs-detail-content" key={selectedDetail.id}>
                <div className="th-jobs-detail-topline">
                  <div className="th-jobs-detail-brand">
                    <div>
                      <h3>{selectedDetail.title}</h3>
                      <p>
                        {shown(selectedDetail.employer_name)} ·{" "}
                        {shown(selectedDetail.location_text)}
                        {selectedDetail.work_mode &&
                        selectedDetail.work_mode !== "unknown"
                          ? ` · ${selectedDetail.work_mode === "onsite" ? "On-site" : selectedDetail.work_mode === "hybrid" ? "Hybrid" : "Remote"}`
                          : ""}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="th-jobs-detail-actions">
                  <Link
                    className="th-jobs-tailor-link"
                    href={`/cv-studio?jobId=${encodeURIComponent(selectedDetail.id)}`}
                  >
                    ▤ Tailor my CV
                  </Link>
                  <Button
                    variant={selectedDetail.state === "saved" ? "primary" : "secondary"}
                    disabled={stateBusy || detailLoading}
                    onClick={() =>
                      void updateJobState(
                        selectedDetail,
                        selectedDetail.state === "saved" ? null : "saved",
                      )
                    }
                  >
                    {selectedDetail.state === "saved" ? "✓ Saved · Remove save" : "♧ Save"}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      if (sourceUrl)
                        window.open(sourceUrl, "_blank", "noopener,noreferrer");
                    }}
                    disabled={!sourceUrl}
                  >
                    ↗ View source listing
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => applicationUrl && openApplicationLink(selectedDetail, applicationUrl)}
                    disabled={!applicationUrl || stateBusy || detailLoading}
                  >
                    ↗ Go to application page
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setForceAppliedPrompt(true)}
                    disabled={stateBusy || detailLoading || Boolean(selectedActivity?.applied_at)}
                  >
                    {selectedActivity?.applied_at ? "✓ Applied" : "→ I applied"}
                  </Button>
                </div>
                {(forceAppliedPrompt || (selectedActivity?.application_link_opened_at && !selectedActivity?.applied_at && promptDismissedForJobId !== selectedDetail.id)) && (
                  <section className="th-jobs-applied-prompt" aria-labelledby="th-jobs-applied-prompt-title">
                    <div>
                      <h4 id="th-jobs-applied-prompt-title">Did you apply for this role?</h4>
                      <p>{selectedActivity?.application_link_opened_at ? "You previously opened this application link. Opening it does not mean an application was submitted." : "Confirm that you submitted an application for this role. Thungatha will record your confirmation."}</p>
                    </div>
                    <div className="th-jobs-applied-prompt-actions">
                      <Button disabled={stateBusy} onClick={() => void confirmApplied()}>Yes, I applied</Button>
                      <Button variant="secondary" disabled={stateBusy} onClick={() => { setPromptDismissedForJobId(selectedDetail.id); setForceAppliedPrompt(false); }}>No, not yet</Button>
                    </div>
                  </section>
                )}
                {activityError && <p className="th-jobs-state-error" role="status">{activityError}</p>}
                <div className="th-jobs-source-status">
                  <span data-available={Boolean(sourceUrl)}>
                    ✓{" "}
                    {sourceUrl
                      ? "Official site found"
                      : "Source link unavailable"}
                  </span>
                  <p>
                    Found via {sourceLabel(selectedSource)}
                    {applicationUrl
                      ? " · Application page available"
                      : " · Application link not supplied"}
                  </p>
                </div>
                <section
                  className="th-jobs-match-placeholder"
                  aria-label="Future job match analysis"
                >
                  <header>
                    <div>
                      <h4>Match</h4>
                      <p>Based on your confirmed profile</p>
                    </div>
                    <span className="th-jobs-match-coming">
                      Coming in a later checkpoint
                    </span>
                  </header>
                  <div className="th-jobs-match-score">
                    <strong>—</strong>
                    <span>Match analysis not available yet</span>
                  </div>
                  <div className="th-jobs-match-track" aria-hidden="true">
                    <span />
                  </div>
                  <div className="th-jobs-match-categories">
                    <span>Confirmed</span>
                    <span>Inferred</span>
                    <span>Missing</span>
                    <span>Can’t verify</span>
                  </div>
                  <p>
                    Match scores and requirement evidence will appear here when
                    profile-based matching is implemented. No score is
                    calculated in this checkpoint.
                  </p>
                </section>
                <section className="th-jobs-detail-card">
                  <header>
                    <h4>Job details</h4>
                  </header>
                  <dl className="th-jobs-facts">
                    <div>
                      <dt>Employer</dt>
                      <dd>{shown(selectedDetail.employer_name)}</dd>
                    </div>
                    <div>
                      <dt>Location</dt>
                      <dd>
                        {shown(selectedDetail.location_text)}
                        {selectedDetail.work_mode &&
                        selectedDetail.work_mode !== "unknown"
                          ? ` (${selectedDetail.work_mode === "onsite" ? "On-site" : selectedDetail.work_mode === "hybrid" ? "Hybrid" : "Remote"})`
                          : ""}
                      </dd>
                    </div>
                    <div>
                      <dt>Job type</dt>
                      <dd>{shown(selectedDetail.employment_type)}</dd>
                    </div>
                    <div>
                      <dt>Salary</dt>
                      <dd>
                        {formatSalary(selectedDetail) ??
                          "Not stated in the listing"}
                      </dd>
                    </div>
                    <div>
                      <dt>Posted</dt>
                      <dd>
                        {formatDate(selectedSource?.published_at) ??
                          "Date not provided"}
                      </dd>
                    </div>
                    <div>
                      <dt>Source</dt>
                      <dd>
                        {sourceUrl ? (
                          <a
                            href={sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {sourceLabel(selectedSource)}
                          </a>
                        ) : (
                          sourceLabel(selectedSource)
                        )}
                      </dd>
                    </div>
                  </dl>
                  <div className="th-jobs-description">
                    <h4>Job description</h4>
                    {selectedDetail.description?.trim() ? (
                      <p>{selectedDetail.description}</p>
                    ) : (
                      <p className="th-jobs-muted">
                        The source did not provide a job description.
                      </p>
                    )}
                  </div>
                </section>
                <p className="th-jobs-integrity-note">
                  Opening an application link records a visit only. Your application is recorded only after you confirm it.
                </p>
                {detailLoading && (
                  <p className="th-jobs-muted" role="status">
                    Refreshing job details…
                  </p>
                )}
                {detailError && (
                  <p className="th-jobs-muted" role="status">
                    Showing the listing data available in the feed. Full detail
                    refresh failed: {detailError}{" "}
                    <button
                      type="button"
                      onClick={() => setRetryDetail((value) => value + 1)}
                    >
                      Retry
                    </button>
                  </p>
                )}
              </div>
            ) : null}
          </section>
        </div>
      </main>
    </WorkspaceShell>
  );
}
