"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "./jobs-discovery.css";
import { JobCard } from "./shared/job-card";
import { Button } from "@/components/ui/button";
import Dialog from "@mui/material/Dialog";
import { ProfileSetupDialog } from "./authenticated/profile-setup-dialog";
import { MatchBreakdownDialog } from "./authenticated/match-breakdown-dialog";
import { ApplicationConfirmationDialog } from "./authenticated/application-confirmation-dialog";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { Toast } from "@/components/ui/toast";
import {
  Search,
  MapPin,
  SlidersHorizontal,
  ArrowDownUp,
  CalendarDays,
  ChevronRight,
  ExternalLink,
  PanelsTopLeft,
  Bookmark,
  EyeOff,
  BriefcaseBusiness,
  Clock3,
  Info,
  X,
  Check,
  ArrowLeft,
} from "lucide-react";

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
const PAGE_SIZE = 30;

function sourceFor(job: Job | null): JobSource | null {
  if (!job?.job_sources) return null;
  return Array.isArray(job.job_sources)
    ? (job.job_sources[0] ?? null)
    : job.job_sources;
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

export default function JobsDiscovery({
  configured,
  showProfileSetupPrompt = false,
}: {
  configured: boolean;
  showProfileSetupPrompt?: boolean;
}) {
  const router = useRouter();
  const [profileSetupPrompt, setProfileSetupPrompt] = useState(
    showProfileSetupPrompt,
  );
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
  const [undoAction, setUndoAction] = useState<{
    jobId: string;
    title: string;
    previousState: "saved" | "dismissed" | null;
    nextState: "saved" | "dismissed" | null;
  } | null>(null);
  const [jobActivity, setJobActivity] = useState<{
    jobId: string;
    activity: JobActivity;
  } | null>(null);
  const [activityError, setActivityError] = useState<string | null>(null);
  const [forceAppliedPrompt, setForceAppliedPrompt] = useState(false);
  const [dismissedPromptForJobId, setDismissedPromptForJobId] = useState<
    string | null
  >(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [matchOpen, setMatchOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState("newest");
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!showProfileSetupPrompt) return;
    // Remove the one-time prompt flag without triggering a Next.js RSC navigation.
    window.history.replaceState(null, "", "/jobs");
  }, [showProfileSetupPrompt]);

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
        const canReusePublicFeed =
          page === 1 &&
          category === "new" &&
          !filters.query.trim() &&
          !filters.location.trim() &&
          !filters.workMode.trim() &&
          !filters.employmentType.trim() &&
          filters.publishedWithin === "30d";
        if (canReusePublicFeed) {
          try {
            const cached = JSON.parse(
              sessionStorage.getItem("thungatha-public-job-feed-v1") ?? "null",
            ) as { savedAt?: number; feed?: Feed } | null;
            if (
              cached?.feed &&
              typeof cached.savedAt === "number" &&
              Date.now() - cached.savedAt < 5 * 60 * 1000 &&
              Array.isArray(cached.feed.jobs)
            ) {
              const stateResponse = await fetch(
                "/api/jobs?state=all&statesOnly=1",
                { headers: { Accept: "application/json" }, cache: "no-store", signal },
              );
              if (stateResponse.ok) {
                const payload = (await stateResponse.json()) as {
                  states?: { job_id: string; state: "saved" | "dismissed" }[];
                };
                const states = payload.states ?? [];
                if (!states.some((item) => item.state === "dismissed")) {
                  const stateById = new Map(states.map((item) => [item.job_id, item.state]));
                  const reusedFeed = {
                    ...cached.feed,
                    jobs: cached.feed.jobs.map((job) => ({
                      ...job,
                      state: stateById.get(job.id) ?? null,
                    })),
                  };
                  setIsAuthenticated(true);
                  setFeed(reusedFeed);
                  setSelectedId((current) =>
                    current && reusedFeed.jobs.some((job) => job.id === current)
                      ? current
                      : reusedFeed.jobs[0]?.id ?? null,
                  );
                  return;
                }
              }
            }
          } catch {
            // If the short-lived public cache is unavailable, load the full feed.
          }
        }
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
        setFeed((current) => {
          if (page > 1 && current) {
            const knownIds = new Set(current.jobs.map((job) => job.id));
            return {
              ...data,
              jobs: [
                ...current.jobs,
                ...data.jobs.filter((job) => !knownIds.has(job.id)),
              ],
            };
          }
          return data;
        });
        setSelectedId((current) =>
          current && (page > 1 || data.jobs.some((job) => job.id === current))
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
    [params, page],
  );

  useEffect(() => {
    const controller = new AbortController();
    void Promise.resolve().then(() => refreshFeed(controller.signal));
    return () => controller.abort();
  }, [refreshFeed, retryFeed]);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (
      !target ||
      loading ||
      !feed ||
      page >= feed.totalPages ||
      typeof IntersectionObserver === "undefined"
    )
      return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setPage((current) =>
            current < feed.totalPages ? current + 1 : current,
          );
        }
      },
      { root: null, rootMargin: "500px 0px", threshold: 0 },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [loading, feed, page]);

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
    let controller: AbortController | null = null;

    const loadActivity = () => {
      controller?.abort();
      controller = new AbortController();
      const requestController = controller;
      void fetch(`/api/jobs/${encodeURIComponent(jobId)}/activity`, {
        headers: { Accept: "application/json" },
        cache: "no-store",
        signal: requestController.signal,
      })
        .then(async (response) => {
          if (!response.ok) throw new Error(await getApiError(response));
          const payload = (await response.json()) as { activity?: JobActivity };
          if (!payload.activity)
            throw new Error("Unexpected activity response");
          setActivityError(null);
          setJobActivity({ jobId, activity: payload.activity });
        })
        .catch((reason) => {
          if (reason instanceof Error && reason.name === "AbortError") return;
          setActivityError("Application activity could not be loaded.");
        });
    };

    // Refresh persisted activity on return, but do not reopen a prompt the
    // user has already dismissed. Confirmation is shown only after an action.
    const handleReturnToPage = () => {
      // A pending reminder is durable: returning from the employer tab should
      // surface it again unless the application was confirmed.
      setForceAppliedPrompt(false);
      setDismissedPromptForJobId(null);
      loadActivity();
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") handleReturnToPage();
    };

    loadActivity();
    window.addEventListener("focus", handleReturnToPage);
    window.addEventListener("pageshow", handleReturnToPage);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      controller?.abort();
      window.removeEventListener("focus", handleReturnToPage);
      window.removeEventListener("pageshow", handleReturnToPage);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
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
            ...(nextState
              ? { body: JSON.stringify({ state: nextState }) }
              : {}),
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
    // Show the question immediately for this selected role, independent of
    // whether the activity API succeeds or the user returns from the new tab.
    setForceAppliedPrompt(true);
    setDismissedPromptForJobId(null);
    // Open synchronously from the click so the browser does not block the new tab.
    window.open(url, "_blank", "noopener,noreferrer");
    setStateError(null);
    void fetch(`/api/jobs/${encodeURIComponent(job.id)}/activity`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action: "opened_application" }),
      cache: "no-store",
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(await getApiError(response));
        const payload = (await response.json()) as { activity: JobActivity };
        setJobActivity({ jobId: job.id, activity: payload.activity });
      })
      .catch(() => {
        setStateError(
          "The application page opened, but Thungatha could not record that visit.",
        );
      });
  };

  const confirmApplied = async () => {
    if (!selectedDetail || stateBusy) return;
    setStateBusy(true);
    setStateError(null);
    try {
      const response = await fetch(
        `/api/jobs/${encodeURIComponent(selectedDetail.id)}/activity`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: "confirm_applied" }),
          cache: "no-store",
        },
      );
      if (!response.ok) {
        setStateError(await getApiError(response));
        return;
      }
      const payload = (await response.json()) as { activity: JobActivity };
      setJobActivity({ jobId: selectedDetail.id, activity: payload.activity });
      setForceAppliedPrompt(false);
      setDismissedPromptForJobId(null);
      setStateMessage("Application confirmation recorded.");
      setRetryFeed((value) => value + 1);
    } catch {
      setStateError(
        "Could not record your application confirmation. Please try again.",
      );
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
  const selectedDetail =
    detail?.id === selectedId
      ? detail
      : (feed?.jobs.find((job) => job.id === selectedId) ?? null);
  const selectedSource = sourceFor(selectedDetail);
  const selectedActivity =
    jobActivity?.jobId === selectedId ? jobActivity.activity : null;
  const applicationUrl = safeExternalUrl(selectedSource?.application_url);
  const jobSourceUrl = safeExternalUrl(selectedSource?.source_url);
  const applicationDestination = applicationUrl ?? jobSourceUrl;
  const range =
    !feed || feed.total === 0
      ? "0 jobs"
      : `1–${Math.min(feed.jobs.length, feed.total)} of ${feed.total}`;
  const hasFilters = Object.entries(filters).some(([key, value]) =>
    key === "publishedWithin" ? value !== "30d" : Boolean(value),
  );

  const visibleJobs = [...(feed?.jobs ?? [])].sort((a, b) => {
    const da =
      new Date(sourceFor(a)?.published_at ?? a.updated_at ?? 0).getTime() || 0;
    const db =
      new Date(sourceFor(b)?.published_at ?? b.updated_at ?? 0).getTime() || 0;
    return sortOrder === "oldest" ? da - db : db - da;
  });
  const categories = [
    { key: "all", label: "All opportunities", count: feed?.total ?? 0 },
    { key: "full-time", label: "Full-time", count: null },
    { key: "part-time", label: "Part-time", count: null },
    { key: "contract", label: "Contract", count: null },
    { key: "internship", label: "Internships", count: null },
    { key: "learnership", label: "Learnerships", count: null },
    { key: "graduate", label: "Graduate programmes", count: null },
  ];
  return (
    <WorkspaceShell active="/jobs" configured={configured}>
      <main className="th-jobs-page th-jobs-redesign">
        {!isAuthenticated && (
          <div className="th-jobs-auth-notice" role="status">
            <p>
              Your session has expired. Sign in again to browse job listings.
            </p>
            <Link href="/sign-in">Go to sign in</Link>
          </div>
        )}
        <header className="th-jobs-header th-jobs-redesign-header">
          <div>
            <h1>Job Discovery</h1>
            <p className="th-jobs-subtitle">
              Official employer opportunities in Cape Town and surrounding areas
            </p>
          </div>
          <form className="th-jobs-toolbar" onSubmit={submitFilters}>
            <label className="th-jobs-quick-search">
              <Search aria-hidden="true" size={17} strokeWidth={1.7} />
              <input
                aria-label="Search roles, skills, or companies"
                name="query"
                placeholder="Search roles, skills, or companies..."
                value={draft.query}
                onChange={(e) => changeDraft("query", e.target.value)}
              />
            </label>
            <label className="th-jobs-location-select">
              <MapPin aria-hidden="true" size={17} strokeWidth={1.7} />
              <select
                aria-label="Location"
                value={draft.location}
                onChange={(e) => changeDraft("location", e.target.value)}
              >
                <option value="">Cape Town + 50 km</option>
                <option value="Cape Town">Cape Town</option>
                <option value="Stellenbosch">Stellenbosch</option>
                <option value="Western Cape">Western Cape</option>
              </select>
            </label>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setFiltersOpen((v) => !v)}
              aria-expanded={filtersOpen}
            >
              <SlidersHorizontal size={15} /> Filters
            </Button>
          </form>
        </header>
        <div
          className="th-jobs-category-strip"
          role="group"
          aria-label="Opportunity categories"
        >
          {categories.map((item) => (
            <button
              key={item.key}
              type="button"
              data-active={
                item.key === "all" ? category === "new" : category === item.key
              }
              onClick={() => {
                if (item.key === "all") {
                  setCategory("new");
                  setPage(1);
                  return;
                }
                if (["saved", "dismissed"].includes(item.key)) {
                  setCategory(item.key);
                  setPage(1);
                  return;
                }
                changeDraft("employmentType", item.label);
                setFilters((current) => ({
                  ...current,
                  employmentType: item.label,
                }));
                setPage(1);
              }}
            >
              {item.label}
              {item.count !== null && <span>{item.count}</span>}
            </button>
          ))}
          <label className="th-jobs-sort">
            <ArrowDownUp size={15} />
            <select
              aria-label="Sort jobs"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="newest">Sort: Newest</option>
              <option value="oldest">Sort: Oldest</option>
            </select>
          </label>
        </div>
        {undoAction && (
          <div className="th-jobs-undo-snackbar" role="status">
            <span>
              {undoAction.title}{" "}
              {undoAction.nextState === "saved"
                ? "saved"
                : undoAction.nextState === "dismissed"
                  ? "dismissed"
                  : "updated"}
              .
            </span>
            <Button
              variant="secondary"
              disabled={stateBusy}
              onClick={() => void undoLastStateChange()}
            >
              Undo
            </Button>
            <button
              type="button"
              className="th-jobs-notice-close"
              aria-label="Dismiss notice"
              onClick={() => setUndoAction(null)}
            >
              <X size={16} />
            </button>
          </div>
        )}
        {stateMessage && !undoAction && (
          <Toast
            message={stateMessage}
            tone="success"
            onDismiss={() => setStateMessage(null)}
          />
        )}
        {stateError && (
          <Toast
            message={stateError}
            tone="error"
            onDismiss={() => setStateError(null)}
          />
        )}
        <div className="th-jobs-workspace th-jobs-redesign-workspace">
          <section
            className={`th-jobs-results-panel th-jobs-redesign-results ${mobileDetail ? "th-jobs-mobile-hidden" : ""}`}
            aria-label="Job search results"
            aria-busy={loading}
          >
            <div className="th-jobs-results-head">
              <span>{loading ? "Updating…" : range + " opportunities"}</span>
              <span className="th-jobs-label">Official-source listings</span>
            </div>
            {loading && !feed ? (
              <div className="th-jobs-state" role="status">
                <span className="th-jobs-spinner" aria-hidden="true" />
                <strong>Loading opportunities</strong>
              </div>
            ) : error ? (
              <div className="th-jobs-state" role="alert">
                <strong>We couldn’t load opportunities</strong>
                <p>{error}</p>
                <Button onClick={() => setRetryFeed((v) => v + 1)}>
                  Retry
                </Button>
              </div>
            ) : visibleJobs.length === 0 ? (
              <div className="th-jobs-state">
                <strong>
                  {hasFilters
                    ? "No opportunities match these filters"
                    : "No active opportunities available"}
                </strong>
                <p>Try changing your search or filters.</p>
              </div>
            ) : (
              <>
                {visibleJobs.map((job) => {
                  const source = sourceFor(job);
                  return (
                    <JobCard
                      key={job.id}
                      job={job}
                      variant="authenticated"
                      selected={job.id === selectedId}
                      postedLabel={source?.published_at ? formatDate(source.published_at) || "Date unknown" : "Date unknown"}
                      onSelect={() => {
                        setSelectedId(job.id);
                        setForceAppliedPrompt(false);
                        setDismissedPromptForJobId(null);
                        setActivityError(null);
                        setMobileDetail(true);
                      }}
                    />
                  );
                })}
                {feed && feed.page < feed.totalPages && (
                  <div
                    ref={loadMoreRef}
                    className="th-jobs-load-more"
                    aria-live="polite"
                  >
                    {loading
                      ? "Loading more opportunities…"
                      : "Scroll to load more opportunities"}
                  </div>
                )}
              </>
            )}
          </section>
          <section
            className={`th-jobs-detail-panel th-jobs-redesign-detail ${mobileDetail ? "th-jobs-mobile-visible" : ""}`}
            aria-label="Selected job details"
            aria-busy={detailLoading}
          >
            {!selectedDetail ? (
              <div className="th-jobs-detail-placeholder">
                <strong>Select an opportunity</strong>
                <p>
                  Choose a listing to view its description and application
                  destination.
                </p>
              </div>
            ) : (
              <div className="th-jobs-detail-content" key={selectedDetail.id}>
                <button
                  type="button"
                  className="th-jobs-mobile-back"
                  onClick={() => setMobileDetail(false)}
                >
                  <ArrowLeft size={17} aria-hidden="true" /> Back to results
                </button>
                <div className="th-jobs-redesign-job-head">
                  <span className="th-jobs-employer-mark th-jobs-detail-logo">
                    {(selectedDetail.employer_name?.trim() || "?")
                      .slice(0, 1)
                      .toUpperCase()}
                  </span>
                  <div className="th-jobs-redesign-title">
                    <h2>{selectedDetail.title}</h2>
                    <p>
                      {shown(selectedDetail.employer_name)}{" "}
                      <ExternalLink
                        className="th-jobs-external-mark"
                        size={13}
                        aria-label="External employer link"
                      />{" "}
                      <span className="th-jobs-verified">
                        ✓ Verified company
                      </span>
                    </p>
                  </div>
                  <div className="th-jobs-match-scorebox">
                    <span>Match</span>
                    <strong>—</strong>
                    <button type="button" onClick={() => setMatchOpen(true)}>
                      View breakdown
                    </button>
                  </div>
                </div>
                <div className="th-jobs-detail-meta">
                  <span>
                    <MapPin size={13} /> {shown(selectedDetail.location_text)}
                  </span>
                  <span>
                    <BriefcaseBusiness size={13} />{" "}
                    {shown(selectedDetail.employment_type)}
                  </span>
                  <span>
                    <Clock3 size={13} />{" "}
                    {selectedDetail.work_mode &&
                    selectedDetail.work_mode !== "unknown"
                      ? selectedDetail.work_mode === "onsite"
                        ? "On-site"
                        : selectedDetail.work_mode === "hybrid"
                          ? "Hybrid"
                          : "Remote"
                      : "Work mode not stated"}
                  </span>
                  <span>
                    <CalendarDays size={13} /> Posted{" "}
                    {formatDate(selectedSource?.published_at) || "date unknown"}
                  </span>
                </div>
                <div className="th-jobs-detail-actions th-jobs-redesign-actions">
                  <Button
                    variant="primary"
                    disabled={
                      !applicationDestination || stateBusy || detailLoading
                    }
                    title={
                      applicationUrl
                        ? "Opens the supplied application destination"
                        : jobSourceUrl
                          ? "Opens the available source listing; it may not be the employer application page"
                          : "No job or application link is available"
                    }
                    onClick={() =>
                      applicationDestination &&
                      openApplicationLink(
                        selectedDetail,
                        applicationDestination,
                      )
                    }
                  >
                    <ExternalLink size={14} />{" "}
                    {applicationUrl
                      ? "Apply on company site"
                      : "Open job listing"}
                  </Button>
                  <Link
                    className="th-jobs-tailor-link"
                    href={`/cv-studio?jobId=${encodeURIComponent(selectedDetail.id)}`}
                  >
                    <PanelsTopLeft size={14} /> Tailor my CV
                  </Link>
                  <Button
                    variant="secondary"
                    disabled={stateBusy || detailLoading}
                    onClick={() =>
                      void updateJobState(
                        selectedDetail,
                        selectedDetail.state === "saved" ? null : "saved",
                      )
                    }
                  >
                    {selectedDetail.state === "saved" ? (
                      <>
                        <Check size={14} /> Saved
                      </>
                    ) : (
                      <>
                        <Bookmark size={14} /> Save
                      </>
                    )}
                  </Button>
                  <Button
                    variant="secondary"
                    disabled={stateBusy || detailLoading}
                    onClick={() =>
                      void updateJobState(
                        selectedDetail,
                        selectedDetail.state === "dismissed"
                          ? null
                          : "dismissed",
                      )
                    }
                  >
                    {selectedDetail.state === "dismissed" ? (
                      "Restore"
                    ) : (
                      <>
                        <EyeOff size={14} /> Dismiss
                      </>
                    )}
                  </Button>
                </div>
                {activityError && (
                  <p className="th-jobs-state-error" role="status">
                    {activityError}
                  </p>
                )}
                {detailError && (
                  <p className="th-jobs-state-error" role="status">
                    {detailError}{" "}
                    <button
                      type="button"
                      onClick={() => setRetryDetail((v) => v + 1)}
                    >
                      Retry
                    </button>
                  </p>
                )}
                <div className="th-jobs-source-status">
                  <span data-available={Boolean(applicationUrl)}>
                    {applicationUrl
                      ? "✓ Application destination available"
                      : "! Employer application link not verified"}
                  </span>
                </div>
                <section className="th-jobs-description-panel th-jobs-redesign-description">
                  <div
                    className="th-jobs-description-tabs"
                    role="tablist"
                    aria-label="Job information"
                  >
                    <button type="button" role="tab" aria-selected="true">
                      Job description
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected="false"
                      onClick={() =>
                        document
                          .getElementById("th-job-requirements")
                          ?.scrollIntoView({ block: "nearest" })
                      }
                    >
                      Requirements
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected="false"
                      onClick={() =>
                        document
                          .getElementById("th-job-benefits")
                          ?.scrollIntoView({ block: "nearest" })
                      }
                    >
                      Benefits
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected="false"
                      onClick={() =>
                        document
                          .getElementById("th-job-about")
                          ?.scrollIntoView({ block: "nearest" })
                      }
                    >
                      About the company
                    </button>
                  </div>
                  <div className="th-jobs-description-body">
                    {selectedDetail.description?.trim() ||
                      "A full job description has not been supplied by the source. Open the employer's application page to review the role requirements before applying."}
                    <section id="th-job-requirements">
                      <h3>Requirements</h3>
                      <p>
                        Requirements will appear here when provided by the
                        employer. Thungatha will not invent missing
                        requirements.
                      </p>
                    </section>
                    <section id="th-job-benefits">
                      <h3>Benefits</h3>
                      <p>
                        Benefits have not been supplied in the available
                        listing.
                      </p>
                    </section>
                    <section id="th-job-about">
                      <h3>About the company</h3>
                      <p>
                        Company information will appear here when an official
                        employer source is available.
                      </p>
                    </section>
                  </div>
                </section>
              </div>
            )}
          </section>
        </div>
        <Dialog
          open={filtersOpen}
          onClose={() => setFiltersOpen(false)}
          fullWidth
          maxWidth="sm"
          aria-label="Filter opportunities"
          slotProps={{
            paper: { className: "th-jobs-popover th-jobs-filter-popover th-jobs-filter-dialog" },
          }}
        >
            <header>
              <strong>Filter opportunities</strong>
              <button
                type="button"
                aria-label="Close filters"
                onClick={() => setFiltersOpen(false)}
              >
                <X size={16} />
              </button>
            </header>
            <form
              onSubmit={(e) => {
                submitFilters(e);
                setFiltersOpen(false);
              }}
            >
              <label>
                Search keywords
                <input
                  className="th-input"
                  value={draft.query}
                  onChange={(e) => changeDraft("query", e.target.value)}
                  placeholder="e.g. Software Engineer, React, Azure…"
                />
              </label>
              <label>
                Location
                <select
                  className="th-input"
                  value={draft.location}
                  onChange={(e) => changeDraft("location", e.target.value)}
                >
                  <option value="">Cape Town + 50 km</option>
                  <option value="Cape Town">Cape Town</option>
                  <option value="Stellenbosch">Stellenbosch</option>
                  <option value="Western Cape">Western Cape</option>
                </select>
              </label>
              <fieldset>
                <legend>Work mode</legend>
                {["onsite", "hybrid", "remote"].map((v) => (
                  <label key={v}>
                    <input
                      type="checkbox"
                      checked={draft.workMode === v}
                      onChange={(e) =>
                        changeDraft("workMode", e.target.checked ? v : "")
                      }
                    />
                    {v === "onsite"
                      ? "On-site"
                      : v[0].toUpperCase() + v.slice(1)}
                  </label>
                ))}
              </fieldset>
              <fieldset>
                <legend>Employment type</legend>
                {[
                  "Full-time",
                  "Part-time",
                  "Contract",
                  "Internship",
                  "Learnership",
                  "Graduate programme",
                ].map((v) => (
                  <label key={v}>
                    <input
                      type="checkbox"
                      checked={draft.employmentType === v}
                      onChange={(e) =>
                        changeDraft("employmentType", e.target.checked ? v : "")
                      }
                    />
                    {v}
                  </label>
                ))}
              </fieldset>
              <label>
                Posted within
                <select
                  className="th-input"
                  value={draft.publishedWithin}
                  onChange={(e) =>
                    changeDraft("publishedWithin", e.target.value)
                  }
                >
                  <option value="24h">Last 24 hours</option>
                  <option value="7d">Last 7 days</option>
                  <option value="14d">Last 14 days</option>
                  <option value="30d">Last 30 days</option>
                </select>
              </label>
              <footer>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={clearFilters}
                >
                  Reset
                </Button>
                <Button type="submit" variant="primary">
                  Apply filters
                </Button>
              </footer>
            </form>
        </Dialog>
        <ProfileSetupDialog
          open={profileSetupPrompt}
          onClose={() => setProfileSetupPrompt(false)}
          onCreateProfile={() => router.push("/profile")}
        />
        <MatchBreakdownDialog
          open={matchOpen}
          onClose={() => setMatchOpen(false)}
        />
        <ApplicationConfirmationDialog
          open={Boolean(
            selectedDetail &&
            (forceAppliedPrompt ||
              (Boolean(selectedActivity?.application_link_opened_at) &&
                !selectedActivity?.applied_at &&
                dismissedPromptForJobId !== selectedId)),
          )}
          busy={stateBusy}
          jobTitle={selectedDetail?.title ?? ""}
          employer={shown(selectedDetail?.employer_name)}
          onClose={() => {
            setForceAppliedPrompt(false);
            if (selectedDetail) setDismissedPromptForJobId(selectedDetail.id);
          }}
          onConfirm={() => void confirmApplied()}
        />
      </main>
    </WorkspaceShell>
  );
}
