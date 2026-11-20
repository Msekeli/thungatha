type JobWithPublicationDate = {
  published_at: string | null;
};

export function jobPublicationDate(job: JobWithPublicationDate): string | null {
  return job.published_at ?? null;
}

export function sortJobDiscoveries<T extends JobWithPublicationDate>(
  jobs: T[],
  order: string,
) {
  // Profile relevance is calculated and sorted across the full filtered
  // catalogue by the server before pagination. Never re-rank only this page.
  if (order === "relevance") return [...jobs];

  return [...jobs].sort((a, b) => {
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
