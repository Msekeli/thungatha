import "server-only";

import {
  normalizedJobSchema,
  type JobSearchQuery,
  type NormalizedJob,
} from "../../schema";
import type { JobProvider } from "../../provider";

const ADZUNA_API_BASE = "https://api.adzuna.com/v1/api/jobs/za/search";

type AdzunaJob = {
  id?: string | number;
  title?: string | null;
  created?: string | null;
  description?: string | null;
  redirect_url?: string | null;
  company?: { display_name?: string | null } | null;
  location?: { display_name?: string | null } | null;
  contract_type?: string | null;
  contract_time?: string | null;
  salary_min?: number | null;
  salary_max?: number | null;
};

type AdzunaResponse = {
  results: AdzunaJob[];
};

export class AdzunaProvider implements JobProvider {
  readonly key = "adzuna";
  readonly kind = "aggregator" as const;

  constructor(
    private readonly appId: string,
    private readonly appKey: string,
  ) {
    if (!appId.trim() || !appKey.trim()) {
      throw new Error("Adzuna API credentials are required.");
    }
  }

  async searchJobs(query: JobSearchQuery): Promise<NormalizedJob[]> {
    const url = new URL(`${ADZUNA_API_BASE}/${query.page}`);

    url.searchParams.set("app_id", this.appId);
    url.searchParams.set("app_key", this.appKey);
    url.searchParams.set("results_per_page", String(query.pageSize));

    if (query.query) url.searchParams.set("what", query.query);
    if (query.location) url.searchParams.set("where", query.location);

    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Adzuna request failed with status ${response.status}.`);
    }

    const payload: unknown = await response.json();

    if (
      typeof payload !== "object" ||
      payload === null ||
      !("results" in payload) ||
      !Array.isArray((payload as AdzunaResponse).results)
    ) {
      throw new Error("Adzuna returned an invalid jobs response.");
    }

    return (payload as AdzunaResponse).results
      .map((job) => this.normalizeJob(job))
      .filter((job): job is NormalizedJob => job !== null)
      .filter((job) => this.matchesQuery(job, query))
      .slice(0, query.pageSize);
  }

  private normalizeJob(job: AdzunaJob): NormalizedJob | null {
    const title = job.title?.trim();
    const externalJobId = job.id == null ? "" : String(job.id);

    if (!title || !externalJobId) return null;

    const parsedDate = job.created ? new Date(job.created) : null;
    const publishedAt =
      parsedDate && !Number.isNaN(parsedDate.getTime())
        ? parsedDate.toISOString()
        : null;

    const result = normalizedJobSchema.safeParse({
      providerKey: this.key,
      providerKind: this.kind,
      externalJobId,
      title,
      employerName: job.company?.display_name?.trim() || null,
      description: job.description?.trim() || null,
      locationText: job.location?.display_name?.trim() || null,
      countryCode: null,
      workMode: "unknown",
      employmentType:
        [job.contract_type, job.contract_time]
          .filter((value): value is string => Boolean(value?.trim()))
          .join(" ") || null,
      salaryMin: this.validSalary(job.salary_min),
      salaryMax: this.validSalary(job.salary_max),
      salaryCurrency: null,
      publishedAt,
      sourceUrl: this.safeHttpUrl(job.redirect_url),
      applicationUrl: null,
      upstreamSource: null,
    });

    return result.success ? result.data : null;
  }

  private validSalary(value: number | null | undefined): number | null {
    return typeof value === "number" && Number.isFinite(value) && value >= 0
      ? value
      : null;
  }

  private safeHttpUrl(value: string | null | undefined): string | null {
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

  private matchesQuery(job: NormalizedJob, query: JobSearchQuery): boolean {
    const searchText = [
      job.title,
      job.employerName ?? "",
      job.description ?? "",
    ]
      .join(" ")
      .toLowerCase();

    const locationText = (job.locationText ?? "").toLowerCase();

    if (query.query && !searchText.includes(query.query.toLowerCase())) {
      return false;
    }

    if (
      query.location &&
      !locationText.includes(query.location.toLowerCase())
    ) {
      return false;
    }

    if (query.countryCode && job.countryCode !== query.countryCode) {
      return false;
    }

    return true;
  }
}
