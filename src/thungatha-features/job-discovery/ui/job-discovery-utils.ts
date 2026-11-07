import { EMPTY_FILTERS, PAGE_SIZE, type Filters } from "./job-discovery-types";

export {
  EMPTY_FILTERS,
  PAGE_SIZE,
  type Feed,
  type Filters,
  type Job,
  type JobActivity,
} from "./job-discovery-types";
export { isValidFeed } from "./job-feed-validation";

type ApiError = { error?: string; requestId?: string };

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
  if (response.status === 401) {
    return "Your session is no longer available. Sign in again to continue.";
  }
  if (response.status === 503) {
    return (
      payload.error || "Job Discovery is temporarily unavailable. Please retry."
    );
  }
  if (response.status === 404) return "This listing is no longer available.";
  return (
    payload.error || "The request could not be completed. Please try again."
  );
}

export function buildJobFeedParams(
  page: number,
  category: string,
  filters: Filters,
  sortOrder = "newest",
): string {
  const search = new URLSearchParams({
    page: String(page),
    pageSize: String(PAGE_SIZE),
    state: category === "saved" || category === "dismissed" ? category : "all",
    sortOrder,
  });
  for (const [key, value] of Object.entries(filters)) {
    if (value.trim()) search.set(key, value.trim());
  }
  return search.toString();
}
