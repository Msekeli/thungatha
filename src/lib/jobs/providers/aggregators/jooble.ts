import "server-only";

import {
  normalizedJobSchema,
  type JobSearchQuery,
  type NormalizedJob,
} from "../../schema";
import type { JobProvider } from "../../provider";

const JOOBLE_API_BASE = (process.env.JOOBLE_API_BASE_URL?.trim() || "https://jooble.org/api").replace(/\/$/, "");

type JoobleJob = {
  title?: string | null;
  location?: string | null;
  company?: string | null;
  snippet?: string | null;
  updated?: string | null;
  link?: string | null;
  source?: string | null;
};

type JoobleResponse = {
  totalCount?: number;
  jobs: JoobleJob[];
};

export class JoobleProvider implements JobProvider {
  readonly key = "jooble";
  readonly kind = "aggregator" as const;

  constructor(private readonly apiKey: string) {
    if (!apiKey.trim()) {
      throw new Error("A Jooble API key is required.");
    }
  }

  async searchJobs(query: JobSearchQuery): Promise<NormalizedJob[]> {
    const response = await fetch(
      `${JOOBLE_API_BASE}/${encodeURIComponent(this.apiKey)}`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          keywords: query.query ?? "software developer",
          location: query.location ?? "",
          page: query.page,
        }),
        signal: AbortSignal.timeout(10_000),
        cache: "no-store",
      },
    );

    if (!response.ok) {
      throw new Error(`Jooble request failed with status ${response.status}.`);
    }

    const payload: unknown = await response.json();

    if (
      typeof payload !== "object" ||
      payload === null ||
      !("jobs" in payload) ||
      !Array.isArray((payload as JoobleResponse).jobs)
    ) {
      throw new Error("Jooble returned an invalid jobs response.");
    }

    const jobs = (payload as JoobleResponse).jobs;

    return jobs
      .map((job) => this.normalizeJob(job))
      .filter((job): job is NormalizedJob => job !== null)
      .filter((job) => this.matchesQuery(job, query))
      .slice(0, query.pageSize);
  }

  private normalizeJob(job: JoobleJob): NormalizedJob | null {
    const title = job.title?.trim();
    if (!title) return null;

    const sourceUrl = this.safeHttpUrl(job.link);
    const externalJobId =
      sourceUrl ??
      [title, job.company?.trim() ?? "", job.location?.trim() ?? ""].join("|");

    const result = normalizedJobSchema.safeParse({
      providerKey: this.key,
      providerKind: this.kind,
      externalJobId,
      title,
      employerName: job.company?.trim() || null,
      description: job.snippet?.trim() || null,
      locationText: job.location?.trim() || null,
      countryCode: null,
      workMode: "unknown",
      employmentType: null,
      salaryMin: null,
      salaryMax: null,
      salaryCurrency: null,
      publishedAt: null,
      sourceUrl,
      applicationUrl: null,
      upstreamSource: job.source?.trim() || null,
    });

    return result.success ? result.data : null;
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
