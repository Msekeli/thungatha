"use client";

import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import { PublicJobDetailPanel } from "./public-job-detail-panel";
import { PublicJobPromo } from "./public-job-promo";
import { PublicJobFiltersPopover } from "./public-job-filters-popover";
import { PublicJobUndoNotice } from "./public-job-undo-notice";
import { PublicJobFiltersPanel } from "./public-job-filters-panel";
import { PublicJobDiscoveryHeader } from "./public-job-discovery-header";
import { PublicJobDiscoverySidebar } from "./public-job-discovery-sidebar";
import { PublicJobDiscoveryHero } from "./public-job-discovery-hero";
import { PublicJobDiscoveryResults } from "./public-job-discovery-results";
import { usePublicDismissedJobs } from "./use-public-dismissed-jobs";
import { usePublicJobFeed } from "./use-public-job-feed";
import { usePublicJobDetail } from "./use-public-job-detail";
import { usePublicJobDiscoveryFilters } from "./use-public-job-discovery-filters";
import { filterPublicJobDiscoveries } from "./filter-public-job-discoveries";

import type {
  PublicJob as Job,
  PublicJobSource as JobSource,
} from "./public-job-types";
function sourceFor(job: Job | null): JobSource | null {
  if (!job?.job_sources) return null;
  return Array.isArray(job.job_sources)
    ? (job.job_sources[0] ?? null)
    : job.job_sources;
}
function dateLabel(value: string | null | undefined): string {
  if (!value) return "Date unknown";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date unknown"
    : new Intl.DateTimeFormat("en-ZA", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(date);
}

export default function PublicJobDiscovery({
  configured,
}: {
  configured: boolean;
}) {
  const filters = usePublicJobDiscoveryFilters();
  const {
    query,
    setQuery,
    location,
    setLocation,
    typesSelected,
    setTypesSelected,
    quickType,
    setQuickType,
    modesSelected,
    setModesSelected,
    sort,
    setSort,
    salary,
    setSalary,
    experience,
    setExperience,
    hasActiveFilters,
    clearFilters,
  } = filters;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [promoVisible, setPromoVisible] = useState(false);
  const [retry, setRetry] = useState(0);
  const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLElement | null>(null);
  const [undoJob, setUndoJob] = useState<Job | null>(null);
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);
  const { dismissedJobs, setDismissedJobs } = usePublicDismissedJobs();
  const [showDismissed, setShowDismissed] = useState(false);
  const feed = usePublicJobFeed(query, location, retry, setSelectedId);
  const { jobs, total, loading, error } = feed;
  const { detail } = usePublicJobDetail(selectedId);

  function dismissJob(jobId: string) {
    const job =
      jobs.find((item) => item.id === jobId) ??
      (detail?.id === jobId ? detail : null);
    if (!job) return;
    setDismissedJobs((current) => [
      job,
      ...current.filter((item) => item.id !== jobId),
    ]);
    setUndoJob(job);
    setSelectedId((current) => (current === jobId ? null : current));
  }
  function restoreJob(jobId: string) {
    setDismissedJobs((current) => current.filter((item) => item.id !== jobId));
    setUndoJob((current) => (current?.id === jobId ? null : current));
    setSelectedId((current) => (current === jobId ? null : current));
  }
  function toggleFilters(anchorEl: HTMLElement) {
    setFilterAnchorEl((current) => (current === anchorEl ? null : anchorEl));
  }
  function undoDismissal() {
    if (undoJob) {
      setDismissedJobs((current) =>
        current.filter((item) => item.id !== undoJob.id),
      );
    }
    setUndoJob(null);
  }
  const filteredJobs = useMemo(
    () =>
      filterPublicJobDiscoveries(jobs, {
        typesSelected,
        quickType,
        modesSelected,
        salary,
        sort,
      }),
    [jobs, typesSelected, quickType, modesSelected, salary, sort],
  );
  const selected = useMemo(() => {
    const source = showDismissed ? dismissedJobs : filteredJobs;
    const selectedJob = selectedId
      ? source.find((j) => j.id === selectedId)
      : null;
    if (selectedJob) return selectedJob;
    if (selectedId && detail?.id === selectedId && !showDismissed)
      return detail;
    return source[0] ?? null;
  }, [showDismissed, dismissedJobs, filteredJobs, selectedId, detail]);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        setPromoVisible(
          sessionStorage.getItem("th-public-promo-dismissed") !== "1",
        );
      } catch {
        setPromoVisible(true);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  function dismissPromo() {
    setPromoVisible(false);
    try {
      sessionStorage.setItem("th-public-promo-dismissed", "1");
    } catch {
      /* optional */
    }
  }
  const visibleJobs = showDismissed
    ? dismissedJobs
    : filteredJobs.filter(
        (job) => !dismissedJobs.some((item) => item.id === job.id),
      );
  const filterPanel = (
    <PublicJobFiltersPanel
      query={query}
      setQuery={setQuery}
      location={location}
      setLocation={setLocation}
      typesSelected={typesSelected}
      setTypesSelected={setTypesSelected}
      modesSelected={modesSelected}
      setModesSelected={setModesSelected}
      salary={salary}
      setSalary={setSalary}
      experience={experience}
      setExperience={setExperience}
      onClose={() => setFilterAnchorEl(null)}
      onClear={clearFilters}
    />
  );
  return (
    <Box
      className="th-discovery-shell"
      sx={{
        minHeight: "100dvh",
        width: "100%",
        maxWidth: "100%",
        m: 0,
        bgcolor: "background.default",
        color: "text.primary",
        boxSizing: "border-box",
        "& *": { boxSizing: "border-box" },
      }}
    >
      <PublicJobDiscoveryHeader
        configured={configured}
        onOpenFilters={toggleFilters}
      />
      <PublicJobDiscoveryHero
        query={query}
        onQueryChange={setQuery}
        location={location}
        onLocationChange={setLocation}
        jobs={jobs}
        quickType={quickType}
        onQuickTypeChange={setQuickType}
        onClearTypes={() => setTypesSelected([])}
        total={total}
        onOpenFilters={toggleFilters}
      />
      <Box
        component="main"
        className="th-discovery-workspace"
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "minmax(0, 1fr)",
            md: "205px minmax(0, 1fr)",
            xl: "250px minmax(370px, 0.95fr) minmax(420px, 1.05fr)",
          },
          minWidth: 0,
          alignItems: "start",
        }}
      >
        <PublicJobDiscoverySidebar configured={configured} />
        <PublicJobDiscoveryResults
          jobs={jobs}
          visibleJobs={visibleJobs}
          configured={configured}
          loading={loading}
          error={error}
          total={total}
          dismissedCount={dismissedJobs.length}
          showingDismissed={showDismissed}
          selectedId={selectedId}
          hasActiveFilters={hasActiveFilters}
          sort={sort}
          query={query}
          promoVisible={promoVisible}
          dateLabel={dateLabel}
          sourceFor={sourceFor}
          onToggleDismissed={() => {
            setShowDismissed((value) => !value);
            setSelectedId(null);
          }}
          onClearFilters={clearFilters}
          onSortChange={setSort}
          onQueryChange={setQuery}
          onOpenFilters={toggleFilters}
          onRetry={() => setRetry((value) => value + 1)}
          onDismiss={dismissJob}
          onRestore={restoreJob}
          onSelect={(jobId) => {
            setSelectedId(jobId);
            setMobileDetailOpen(true);
          }}
          onPromoDismiss={dismissPromo}
        />
        <PublicJobDetailPanel
          job={selected}
          configured={configured}
          mobileOpen={mobileDetailOpen}
          dismissed={Boolean(
            selected && dismissedJobs.some((item) => item.id === selected.id),
          )}
          onDismiss={() => selected && dismissJob(selected.id)}
          onRestore={() => selected && restoreJob(selected.id)}
          onBack={() => setMobileDetailOpen(false)}
        />
      </Box>
      {promoVisible && (
        <PublicJobPromo
          configured={configured}
          variant="wide"
          onDismiss={dismissPromo}
        />
      )}
      <PublicJobFiltersPopover
        anchorEl={filterAnchorEl}
        onClose={() => setFilterAnchorEl(null)}
      >
        {filterPanel}
      </PublicJobFiltersPopover>
      {undoJob && (
        <PublicJobUndoNotice
          key={undoJob.id}
          title={undoJob.title}
          onUndo={undoDismissal}
          onDismiss={() => setUndoJob(null)}
        />
      )}
    </Box>
  );
}
