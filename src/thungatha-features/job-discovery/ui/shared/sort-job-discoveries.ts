type JobWithPublicationDate = {
  updated_at: string | null;
  job_sources: { published_at: string | null }[] | { published_at: string | null } | null;
};

export function jobPublicationDate(job: JobWithPublicationDate) {
  const source = Array.isArray(job.job_sources)
    ? job.job_sources[0]
    : job.job_sources;
  return source?.published_at ?? job.updated_at ?? 0;
}

export function sortJobDiscoveries<T extends JobWithPublicationDate>(
  jobs: T[],
  order: string,
) {
  return [...jobs].sort((a, b) => {
    const difference =
      new Date(jobPublicationDate(a)).getTime() -
      new Date(jobPublicationDate(b)).getTime();
    return order === "oldest" ? difference : -difference;
  });
}
