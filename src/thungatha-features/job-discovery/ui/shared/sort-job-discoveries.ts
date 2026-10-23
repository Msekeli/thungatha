type JobWithPublicationDate = {
  title?: string;
  employer_name?: string | null;
  description?: string | null;
  updated_at: string | null;
  job_sources: { published_at: string | null }[] | { published_at: string | null } | null;
};

export function jobPublicationDate(job: JobWithPublicationDate) {
  const source = Array.isArray(job.job_sources)
    ? job.job_sources[0]
    : job.job_sources;
  return source?.published_at ?? job.updated_at ?? 0;
}

function relevanceScore(job: JobWithPublicationDate, query: string) {
  const terms = query.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return 0;

  const title = (job.title ?? "").toLocaleLowerCase();
  const employer = (job.employer_name ?? "").toLocaleLowerCase();
  const description = (job.description ?? "").toLocaleLowerCase();

  return terms.reduce((score, term) => {
    if (title === term) return score + 12;
    if (title.includes(term)) return score + 6;
    if (employer.includes(term)) return score + 4;
    if (description.includes(term)) return score + 1;
    return score;
  }, 0);
}

export function sortJobDiscoveries<T extends JobWithPublicationDate>(
  jobs: T[],
  order: string,
  query = "",
) {
  return [...jobs].sort((a, b) => {
    if (order === "relevance" && query.trim()) {
      const relevanceDifference = relevanceScore(b, query) - relevanceScore(a, query);
      if (relevanceDifference !== 0) return relevanceDifference;
    }

    const difference =
      new Date(jobPublicationDate(a)).getTime() -
      new Date(jobPublicationDate(b)).getTime();
    return order === "oldest" ? difference : -difference;
  });
}
