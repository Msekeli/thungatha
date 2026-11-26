import type { JobContext, JobForm, State, Suitability } from "./cv-studio-types";
import type { ReusableCv } from "./cv-studio-content-types";

async function requestJson<T>(
  url: string,
  options: RequestInit,
  fallback: string,
): Promise<T> {
  const response = await fetch(url, options);
  const body = await response.json();
  if (!response.ok) throw new Error(body.error ?? fallback);
  return body as T;
}

export function loadCvStudio() {
  return requestJson<State>(
    "/api/cv-studio",
    { cache: "no-store" },
    "CV Studio could not load.",
  );
}

export function assessCvStudioJob(masterVersionId: string, jobContext: JobContext) {
  return requestJson<Suitability>(
    "/api/cv-studio/suitability",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ masterVersionId, jobContext }),
    },
    "The CV recommendation could not be loaded.",
  );
}

export function resolveCvStudioDiscoveryJob(jobId: string) {
  return requestJson<{ jobContext: JobContext }>(
    "/api/cv-studio/job-context",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source: "discovery", jobId }),
    },
    "The selected job could not be loaded.",
  );
}

export function createCvStudioPastedJob(jobForm: JobForm) {
  return requestJson<{ jobContext: JobContext }>(
    "/api/cv-studio/job-context",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source: "pasted", ...jobForm }),
    },
    "The job description could not be validated.",
  );
}

export function reuseCvStudioVersion(versionId: string, jobContext: JobContext) {
  return requestJson<{ version: ReusableCv }>(
    "/api/cv-studio/reuse",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ versionId, jobContext }),
    },
    "The saved CV could not be reused.",
  );
}
