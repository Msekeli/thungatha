import type { PublicJob } from "./public-job-types";

type Filters = {
  typesSelected: string[];
  quickType: string;
  modesSelected: string[];
  salary: string;
  publishedWithin: string;
  sort: string;
};

export function filterPublicJobDiscoveries(
  jobs: PublicJob[],
  filters: Filters,
) {
  let list = jobs.filter((job) => {
    const type = (job.employment_type || "")
      .toLowerCase()
      .replace(/[ -]+/g, "_");
    const mode = (job.work_mode || "").toLowerCase();
    const postedAt = sourceDate(job) || job.updated_at;
    const ageMs = postedAt ? Date.now() - new Date(postedAt).getTime() : null;
    const maxAgeMs = filters.publishedWithin === "24h" ? 24 * 60 * 60 * 1000
      : filters.publishedWithin === "7d" ? 7 * 24 * 60 * 60 * 1000
      : filters.publishedWithin === "14d" ? 14 * 24 * 60 * 60 * 1000
      : 30 * 24 * 60 * 60 * 1000;
    const publishedMatch = ageMs === null || !Number.isFinite(ageMs) || ageMs <= maxAgeMs;
    const salaryMatch =
      filters.salary === "any" ||
      (filters.salary === "disclosed"
        ? job.salary_min != null || job.salary_max != null
        : filters.salary === "above50"
          ? (job.salary_min ?? job.salary_max ?? 0) >= 500000
          : true);
    return (
      (filters.typesSelected.length === 0 ||
        filters.typesSelected.includes(type)) &&
      (filters.quickType === "all" ||
        type === filters.quickType ||
        ((filters.quickType === "learnership" ||
          filters.quickType === "graduate") &&
          type.includes(filters.quickType))) &&
      (filters.modesSelected.length === 0 ||
        filters.modesSelected.includes(mode)) &&
      salaryMatch &&
      publishedMatch
    );
  });
  if (filters.sort === "newest")
    list = [...list].sort(
      (a, b) =>
        new Date(sourceDate(b) || b.updated_at || 0).getTime() -
        new Date(sourceDate(a) || a.updated_at || 0).getTime(),
    );
  return list;
}

function sourceDate(job: PublicJob) {
  const source = job.job_sources;
  return Array.isArray(source) ? source[0]?.published_at : source?.published_at;
}
