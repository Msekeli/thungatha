export type JobSourceLike = {
  source_url?: string | null;
  application_url?: string | null;
  published_at?: string | null;
  availability_status?: string;
  provider_kind?: string;
  provider_key?: string;
  external_job_id?: string;
};

export type JobWithSources = {
  job_sources?: JobSourceLike[] | JobSourceLike | null;
};

export type JobWithSalary = {
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string | null;
};

export function getJobSource<T extends JobWithSources>(
  job: T | null | undefined,
): JobSourceLike | null {
  if (!job?.job_sources) return null;
  return Array.isArray(job.job_sources)
    ? (job.job_sources[0] ?? null)
    : job.job_sources;
}

export function safeExternalUrl(value: string | null | undefined): string | null {
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

export function formatPublicDate(value: string | null | undefined): string {
  if (!value) return "Recently listed";
  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "Recently listed"
    : new Intl.DateTimeFormat("en-ZA", {
        day: "numeric",
        month: "short",
      }).format(date);
}

export function formatSalary(job: JobWithSalary): string | null {
  if (job.salary_min == null && job.salary_max == null) return null;

  const currency = job.salary_currency || "ZAR";
  const format = (amount: number) =>
    new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);

  if (job.salary_min != null && job.salary_max != null) {
    return format(job.salary_min) + " – " + format(job.salary_max);
  }

  return format((job.salary_min ?? job.salary_max)!);
}

export function displayValue(value: string | null | undefined): string {
  return value?.trim() || "Not provided";
}
