type JobWithPublicationDate = {
  title?: string;
  employer_name?: string | null;
  description?: string | null;
  published_at: string | null;
};

export function jobPublicationDate(job: JobWithPublicationDate): string | null {
  return job.published_at ?? null;
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
      const relevanceDifference =
        relevanceScore(b, query) - relevanceScore(a, query);
      if (relevanceDifference !== 0) return relevanceDifference;
    }

    const aPublishedAt = jobPublicationDate(a);
    const bPublishedAt = jobPublicationDate(b);
    if (aPublishedAt === null && bPublishedAt !== null) return 1;
    if (aPublishedAt !== null && bPublishedAt === null) return -1;
    if (aPublishedAt === null || bPublishedAt === null) return 0;

    const aTime = new Date(aPublishedAt).getTime();
    const bTime = new Date(bPublishedAt).getTime();
    if (Number.isNaN(aTime) || Number.isNaN(bTime)) return 0;
    const difference = aTime - bTime;
    return order === "oldest" ? difference : -difference;
  });
}
