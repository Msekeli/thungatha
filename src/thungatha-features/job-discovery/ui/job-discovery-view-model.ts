import {
  safeExternalUrl,
  sourceFor,
  EMPTY_FILTERS,
  type Feed,
  type Filters,
  type Job,
  type JobActivity,
} from "./job-discovery-utils";
import { sortJobDiscoveries } from "./shared/sort-job-discoveries";

export function buildJobDiscoveryViewModel(input: {
  detail: Job | null;
  selectedId: string | null;
  feed: Feed | null;
  jobActivity: { jobId: string; activity: JobActivity } | null;
  filters: Filters;
  sortOrder: string;
}) {
  const { detail, selectedId, feed, jobActivity, filters, sortOrder } = input;
  const selectedDetail =
    detail?.id === selectedId
      ? detail
      : (feed?.jobs.find((job) => job.id === selectedId) ?? null);
  const selectedSource = sourceFor(selectedDetail);
  const selectedActivity =
    jobActivity?.jobId === selectedId ? jobActivity.activity : null;
  const applicationUrl = safeExternalUrl(selectedSource?.application_url);
  const jobSourceUrl = safeExternalUrl(selectedSource?.source_url);
  const visibleJobs = sortJobDiscoveries(
    feed?.jobs ?? [],
    sortOrder,
    filters.query,
  );
  const hasFilters = Object.entries(filters).some(
    ([key, value]) => value !== EMPTY_FILTERS[key as keyof Filters],
  );
  return {
    selectedDetail,
    selectedSource,
    selectedActivity,
    applicationUrl,
    jobSourceUrl,
    applicationDestination: applicationUrl ?? jobSourceUrl,
    range:
      !feed || feed.total === 0
        ? "0 jobs"
        : `1–${Math.min(feed.jobs.length, feed.total)} of ${feed.total}`,
    hasFilters,
    visibleJobs,
    categories: [
      { key: "all", label: "All opportunities", count: feed?.total ?? 0 },
      { key: "full-time", label: "Full-time", count: null },
      { key: "part-time", label: "Part-time", count: null },
      { key: "contract", label: "Contract", count: null },
      { key: "internship", label: "Internships", count: null },
      { key: "learnership", label: "Learnerships", count: null },
      { key: "graduate", label: "Graduate programmes", count: null },
    ],
  };
}
