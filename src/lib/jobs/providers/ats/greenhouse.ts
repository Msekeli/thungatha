import {
  normalizedJobSchema,
  type JobSearchQuery,
  type NormalizedJob,
} from "../../schema";
import type { JobProvider } from "../../provider";

const GREENHOUSE_API_BASE = "https://boards-api.greenhouse.io/v1/boards";

type GreenhouseJob = {
  id: number;
  title: string;
  absolute_url: string;
  updated_at?: string | null;
  location?: {
    name?: string | null;
  } | null;
  departments?: Array<{
    name?: string | null;
  }>;
  offices?: Array<{
    name?: string | null;
  }>;
  content?: string | null;
};

type GreenhouseResponse = {
  jobs: GreenhouseJob[];
};

export class GreenhouseProvider implements JobProvider {
  readonly key = "greenhouse";
  readonly kind = "ats" as const;

  constructor(private readonly boardToken: string) {
    if (!boardToken.trim()) {
      throw new Error("A Greenhouse board token is required.");
    }
  }

  async searchJobs(query: JobSearchQuery): Promise<NormalizedJob[]> {
    const url = new URL(
      `${GREENHOUSE_API_BASE}/${encodeURIComponent(this.boardToken)}/jobs`,
    );

    url.searchParams.set("content", "true");

    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(
        `Greenhouse request failed with status ${response.status}.`,
      );
    }

    const payload: unknown = await response.json();

    if (
      typeof payload !== "object" ||
      payload === null ||
      !("jobs" in payload) ||
      !Array.isArray((payload as GreenhouseResponse).jobs)
    ) {
      throw new Error("Greenhouse returned an invalid jobs response.");
    }

    const jobs = (payload as GreenhouseResponse).jobs;

    return jobs
      .map((job) => this.normalizeJob(job))
      .filter((job): job is NormalizedJob => job !== null)
      .filter((job) => this.matchesQuery(job, query));
  }

  private normalizeJob(job: GreenhouseJob): NormalizedJob | null {
    const location = job.location?.name?.trim() || null;
    const sourceUrl = this.safeHttpUrl(job.absolute_url);

    const result = normalizedJobSchema.safeParse({
      providerKey: this.key,
      providerKind: this.kind,
      externalJobId: String(job.id),
      title: job.title,
      employerName: null,
      description: job.content?.trim() || null,
      locationText: location,
      countryCode: null,
      workMode: "unknown",
      employmentType: null,
      salaryMin: null,
      salaryMax: null,
      salaryCurrency: null,
      publishedAt: null,
      sourceUrl,
      applicationUrl: null,
    });

    return result.success ? result.data : null;
  }

  private safeHttpUrl(value: string | undefined): string | null {
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
    const searchText =
      `${job.title} ${job.employerName ?? ""} ${job.description ?? ""}`.toLowerCase();
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
