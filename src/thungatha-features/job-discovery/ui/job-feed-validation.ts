import type { Feed } from "./job-discovery-types";

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
        typeof job.scout_vacancy_id === "string" &&
        typeof job.title === "string" &&
        typeof job.employer_name === "string" &&
        (job.company_logo_url === null || typeof job.company_logo_url === "string") &&
        typeof job.location_text === "string" &&
        typeof job.description === "string" &&
        typeof job.application_url === "string" &&
        (job.published_at === null || typeof job.published_at === "string") &&
        (job.source_updated_at === null || typeof job.source_updated_at === "string") &&
        typeof job.updated_at === "string" &&
        (job.state === null || job.state === "saved" || job.state === "dismissed"),
    )
  );
}
