import { getApiError, isValidFeed, type Feed } from "./job-discovery-utils";

export class JobFeedRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "JobFeedRequestError";
  }
}

export async function requestJobFeed(
  params: string,
  signal: AbortSignal,
): Promise<Feed> {
  const response = await fetch(`/api/jobs?${params}`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
    signal,
  });
  if (!response.ok)
    throw new JobFeedRequestError(await getApiError(response), response.status);
  const data: unknown = await response.json();
  if (!isValidFeed(data))
    throw new JobFeedRequestError(
      "The jobs service returned an unexpected response. Please retry.",
      response.status,
    );
  return data;
}
