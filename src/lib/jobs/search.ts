import "server-only";

import { getJobProviders } from "./providers/config";
import { jobSearchQuerySchema, type NormalizedJob } from "./schema";

export async function searchJobs(input: unknown): Promise<NormalizedJob[]> {
  const query = jobSearchQuerySchema.parse(input);
  const providers = getJobProviders();

  if (providers.length === 0) {
    throw new Error("No job providers are configured.");
  }

  const results = await Promise.allSettled(
    providers.map((provider) => provider.searchJobs(query)),
  );

  const jobs: NormalizedJob[] = [];
  const failures: { provider: string; errorName: string }[] = [];

  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      jobs.push(...result.value);
      return;
    }

    failures.push({
      provider: providers[index].key,
      errorName:
        result.reason instanceof Error ? result.reason.name : "unknown",
    });
  });

  if (failures.length > 0) {
    console.warn("Some job providers failed during search:", failures);
  }

  if (jobs.length === 0 && failures.length === providers.length) {
    throw new Error("All configured job providers failed.");
  }

  const seen = new Set<string>();

  const uniqueJobs = jobs.filter((job) => {
    const key = `${job.providerKey}:${job.externalJobId}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });

  return uniqueJobs.slice(0, query.pageSize);
}
