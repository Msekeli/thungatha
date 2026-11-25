"use client";

import { useEffect, useState } from "react";
import type { AssessmentStatus, MatchAssessment } from "./match-assessment-types";

export function useMatchAssessment(open: boolean, jobId: string | null) {
  const [status, setStatus] = useState<AssessmentStatus>("idle");
  const [assessment, setAssessment] = useState<MatchAssessment | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryError, setRetryError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !jobId) return;
    const controller = new AbortController();
    setStatus("loading");
    setAssessment(null);

    fetch(`/api/jobs/${jobId}/match-assessment`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Assessment could not be loaded.");
        return response.json() as Promise<{
          status: AssessmentStatus;
          assessment?: MatchAssessment | null;
        }>;
      })
      .then((result) => {
        setStatus(result.status);
        setAssessment(result.assessment ?? null);
      })
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === "AbortError") return;
        setStatus("error");
      });
    return () => controller.abort();
  }, [open, jobId]);

  useEffect(() => {
    if (!open || !jobId || status !== "pending") return;
    const interval = window.setInterval(async () => {
      try {
        const response = await fetch(`/api/jobs/${jobId}/match-assessment`);
        if (!response.ok) return;
        const result = (await response.json()) as {
          status: AssessmentStatus;
          assessment?: MatchAssessment | null;
        };
        if (result.status !== "pending") {
          setStatus(result.status);
          setAssessment(result.assessment ?? null);
        }
      } catch {
        // Retain pending state; the next poll can recover from transient failures.
      }
    }, 5000);
    return () => window.clearInterval(interval);
  }, [open, jobId, status]);

  async function retryAssessment() {
    if (!jobId || isRetrying) return;
    setIsRetrying(true);
    setRetryError(null);
    try {
      const response = await fetch(`/api/jobs/${jobId}/match-assessment`, {
        method: "POST",
      });
      if (!response.ok) {
        const result = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(result?.error ?? "The assessment could not be retried.");
      }
      setAssessment(null);
      setStatus("pending");
    } catch (error) {
      setRetryError(
        error instanceof Error ? error.message : "The assessment could not be retried.",
      );
    } finally {
      setIsRetrying(false);
    }
  }

  return { status, assessment, isRetrying, retryError, retryAssessment };
}
