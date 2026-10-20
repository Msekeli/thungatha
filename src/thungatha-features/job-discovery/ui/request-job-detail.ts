import { getApiError } from "./job-discovery-utils";

export class JobDetailRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "JobDetailRequestError";
  }
}

export async function requestJobDetail<T extends { id: string }>(
  id: string,
  signal: AbortSignal,
): Promise<T> {
  const response = await fetch(`/api/jobs/${encodeURIComponent(id)}`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
    signal,
  });

  if (!response.ok) {
    throw new JobDetailRequestError(
      await getApiError(response),
      response.status,
    );
  }

  const payload: unknown = await response.json();
  if (
    !payload ||
    typeof payload !== "object" ||
    !("job" in payload) ||
    !payload.job ||
    typeof payload.job !== "object" ||
    !("id" in payload.job) ||
    typeof payload.job.id !== "string"
  ) {
    throw new JobDetailRequestError(
      "The job details service returned an unexpected response. Please retry.",
      response.status,
    );
  }

  return payload.job as T;
}
