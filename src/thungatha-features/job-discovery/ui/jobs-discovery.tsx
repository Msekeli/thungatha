"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "./jobs-discovery.css";
import { AuthenticatedJobResultsPanel } from "./authenticated/job-results-panel";
import { AuthenticatedJobSearchToolbar } from "./authenticated/job-search-toolbar";
import { ProfileSetupDialog } from "./authenticated/profile-setup-dialog";
import { MatchBreakdownDialog } from "./authenticated/match-breakdown-dialog";
import { ApplicationConfirmationDialog } from "./authenticated/application-confirmation-dialog";
import { JobFiltersDialog } from "./authenticated/job-filters-dialog";
import { AuthenticatedJobDetailPanel } from "./authenticated/job-detail-panel";
import { JobUndoNotice } from "./authenticated/job-undo-notice";
import { JobCategoryStrip } from "./authenticated/job-category-strip";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { Toast } from "@/components/ui/toast";
import { Check } from "lucide-react";
import { useJobActivitySync } from "./hooks/use-job-activity-sync";

import {
  EMPTY_FILTERS, PAGE_SIZE, formatDate, getApiError, safeExternalUrl, shown, sourceFor,
  type Feed, type Filters, type Job, type JobActivity,
} from "./job-discovery-utils";

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

  useJobActivitySync(
    selectedId,
    setJobActivity,
    setActivityError,
    setForceAppliedPrompt,
    setDismissedPromptForJobId,
  );

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
          <AuthenticatedJobSearchToolbar
            query={draft.query}
            location={draft.location}
            filtersOpen={filtersOpen}
            onQueryChange={(value) => changeDraft("query", value)}
            onLocationChange={(value) => changeDraft("location", value)}
            onSubmit={submitFilters}
            onToggleFilters={() => setFiltersOpen((value) => !value)}
          />
        </header>
        <JobCategoryStrip
          categories={categories}
          category={category}
          sortOrder={sortOrder}
          onSortChange={setSortOrder}
          onCategoryChange={(key, label) => {
            if (key === "all" || key === "saved" || key === "dismissed") {
              setCategory(key === "all" ? "new" : key);
              setPage(1);
              return;
            }
            changeDraft("employmentType", label);
            setFilters(current => ({ ...current, employmentType: label }));
            setPage(1);
          }}
        />
        {undoAction && (
          <JobUndoNotice
            action={undoAction}
            busy={stateBusy}
            onUndo={() => void undoLastStateChange()}
            onDismiss={() => setUndoAction(null)}
          />
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
          <AuthenticatedJobResultsPanel
            jobs={visibleJobs}
            feed={feed}
            loading={loading}
            error={error}
            hasFilters={hasFilters}
            mobileDetail={mobileDetail}
            selectedId={selectedId}
            loadMoreRef={loadMoreRef}
            sourceFor={sourceFor}
            formatDate={formatDate}
            onRetry={() => setRetryFeed((v) => v + 1)}
            onSelect={(job) => {
              setSelectedId(job.id);
              setForceAppliedPrompt(false);
              setDismissedPromptForJobId(null);
              setActivityError(null);
              setMobileDetail(true);
            }}
          />
          <AuthenticatedJobDetailPanel
            job={selectedDetail}
            source={selectedSource}
            applicationDestination={applicationDestination}
            applicationUrl={applicationUrl}
            jobSourceUrl={jobSourceUrl}
            busy={stateBusy}
            detailLoading={detailLoading}
            mobileDetail={mobileDetail}
            activityError={activityError}
            detailError={detailError}
            formatDate={formatDate}
            onBack={() => setMobileDetail(false)}
            onViewMatch={() => setMatchOpen(true)}
            onApply={() => applicationDestination && openApplicationLink(selectedDetail!, applicationDestination)}
            onSave={() => selectedDetail && void updateJobState(selectedDetail, selectedDetail.state === "saved" ? null : "saved")}
            onDismiss={() => selectedDetail && void updateJobState(selectedDetail, selectedDetail.state === "dismissed" ? null : "dismissed")}
            onRetry={() => setRetryDetail((v) => v + 1)}
          />
        </div>
        <JobFiltersDialog
          open={filtersOpen}
          draft={draft}
          onClose={() => setFiltersOpen(false)}
          onChange={changeDraft}
          onReset={clearFilters}
          onApply={() => { setFilters({ ...draft }); setPage(1); setMobileDetail(false); setFiltersOpen(false); }}
        />
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
