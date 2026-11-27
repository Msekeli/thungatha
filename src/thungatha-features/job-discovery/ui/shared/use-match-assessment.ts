"use client";

import { useEffect, useState } from "react";
import type {
  AssessmentStatus,
  MatchAssessment,
} from "./match-assessment-types";
import {
  loadMatchAssessment,
  retryMatchAssessment,
} from "./match-assessment-client";

export function useMatchAssessment(open: boolean, jobId: string | null) {
  const [status, setStatus] = useState<AssessmentStatus>("idle");
  const [assessment, setAssessment] = useState<MatchAssessment | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryError, setRetryError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !jobId) return;
    const controller = new AbortController();
    void Promise.resolve().then(() => {
      if (controller.signal.aborted) return;
      setStatus("loading");
      setAssessment(null);
    });
    void loadMatchAssessment(jobId, controller.signal)
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
        const result = await loadMatchAssessment(
          jobId,
          new AbortController().signal,
        );
        if (result.status === "pending") return;
        setStatus(result.status);
        setAssessment(result.assessment ?? null);
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
      await retryMatchAssessment(jobId);
      setAssessment(null);
      setStatus("pending");
    } catch (error) {
      setRetryError(
        error instanceof Error
          ? error.message
          : "The assessment could not be retried.",
      );
    } finally {
      setIsRetrying(false);
    }
  }

  return { status, assessment, isRetrying, retryError, retryAssessment };
}
