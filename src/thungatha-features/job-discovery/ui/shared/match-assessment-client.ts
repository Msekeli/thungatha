import type { AssessmentStatus, MatchAssessment } from "./match-assessment-types";

type AssessmentResponse = {
  status: AssessmentStatus;
  assessment?: MatchAssessment | null;
};

export async function loadMatchAssessment(jobId: string, signal: AbortSignal): Promise<AssessmentResponse> {
  const response = await fetch("/api/jobs/" + jobId + "/match-assessment", { signal });
  if (!response.ok) throw new Error("Assessment could not be loaded.");
  return response.json() as Promise<AssessmentResponse>;
}

export async function retryMatchAssessment(jobId: string): Promise<void> {
  const response = await fetch("/api/jobs/" + jobId + "/match-assessment", { method: "POST" });
  if (response.ok) return;
  const result = (await response.json().catch(() => null)) as { error?: string } | null;
  throw new Error(result?.error ?? "The assessment could not be retried.");
}
