export type JobSource = {
  id: string;
  provider_key: string;
  provider_kind: string;
  external_job_id: string;
  source_url: string | null;
  application_url: string | null;
  published_at: string | null;
  availability_status: string;
};

export type Job = {
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
export type JobActivity = {
  application_link_opened_at: string | null;
  applied_at: string | null;
};
export type Feed = {
  jobs: Job[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};
export type Filters = {
  query: string;
  location: string;
  workMode: string;
  employmentType: string;
  publishedWithin: string;
};
type ApiError = { error?: string; requestId?: string };

export const EMPTY_FILTERS: Filters = {
  query: "",
  location: "Cape Town",
  workMode: "",
  employmentType: "",
  publishedWithin: "30d",
};
export const PAGE_SIZE = 30;

export function sourceFor(job: Job | null): JobSource | null {
  if (!job?.job_sources) return null;
  return Array.isArray(job.job_sources)
    ? (job.job_sources[0] ?? null)
    : job.job_sources;
}
export function shown(value: string | null | undefined): string {
  return value?.trim() || "Not provided";
}
export function safeExternalUrl(
  value: string | null | undefined,
): string | null {
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
export function formatDate(value: string | null | undefined): string | null {
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
export async function getApiError(response: Response): Promise<string> {
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

export function buildJobFeedParams(
  page: number,
  category: string,
  filters: Filters,
): string {
  const search = new URLSearchParams({
    page: String(page),
    pageSize: String(PAGE_SIZE),
    state: category === "saved" || category === "dismissed" ? category : "all",
  });
  for (const [key, value] of Object.entries(filters)) {
    if (value.trim()) search.set(key, value.trim());
  }
  return search.toString();
}

export function isValidFeed(value: unknown): value is Feed {
  if (!value || typeof value !== "object") return false;
  const data = value as Partial<Feed>;
  return (
    Array.isArray(data.jobs) &&
    Number.isInteger(data.page) &&
    data.page! >= 1 &&
    Number.isInteger(data.pageSize) &&
    data.pageSize! >= 1 &&
    Number.isInteger(data.total) &&
    data.total! >= 0 &&
    Number.isInteger(data.totalPages) &&
    data.totalPages! >= 0 &&
    data.totalPages === Math.ceil(data.total! / data.pageSize!) &&
    data.jobs.every(
      (job) =>
        Boolean(job) &&
        typeof job.id === "string" &&
        typeof job.title === "string",
    )
  );
}
