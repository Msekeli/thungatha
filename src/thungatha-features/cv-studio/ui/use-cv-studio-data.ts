"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  assessCvStudioJob,
  resolveCvStudioDiscoveryJob,
} from "./cv-studio-api";
import type { JobContext, Suitability } from "./cv-studio-types";
import { useCvStudioState } from "./cv-studio-state";

export function useCvStudioData(
  userId: string | null,
  enabled = true,
  jobId: string | null = null,
) {
  const { state, setState, load } = useCvStudioState(userId, enabled);
  const [activeJobId, setActiveJobId] = useState(jobId);
  const previousJobId = useRef(jobId);
  const [jobContext, setJobContext] = useState<JobContext | null>(null);
  const [suitability, setSuitability] = useState<Suitability | null>(null);
  const [workflowError, setWorkflowError] = useState<string | null>(null);
  const [workflowBusy, setWorkflowBusy] = useState(false);

  useEffect(() => {
    if (previousJobId.current === jobId) return;
    previousJobId.current = jobId;
    void Promise.resolve().then(() => setActiveJobId(jobId));
  }, [jobId]);

  const assessContext = useCallback(
    async (context: JobContext, masterVersionId: string) => {
      setSuitability(await assessCvStudioJob(masterVersionId, context));
    },
    [],
  );

  const resolveDiscoveryJob = useCallback(
    async (selectedJobId: string, masterVersionId: string) => {
      setWorkflowBusy(true);
      setWorkflowError(null);
      setSuitability(null);
      try {
        const body = await resolveCvStudioDiscoveryJob(selectedJobId);
        setJobContext(body.jobContext);
        await assessContext(body.jobContext, masterVersionId);
      } catch (cause) {
        setWorkflowError(
          cause instanceof Error
            ? cause.message
            : "The selected job could not be loaded.",
        );
      } finally {
        setWorkflowBusy(false);
      }
    },
    [assessContext],
  );

  useEffect(() => {
    if (
      state.status !== "master_cv_ready" ||
      !state.masterCv ||
      !activeJobId ||
      jobContext
    )
      return;
    const masterVersionId = state.masterCv.id;
    void Promise.resolve().then(() =>
      resolveDiscoveryJob(activeJobId, masterVersionId),
    );
  }, [activeJobId, jobContext, resolveDiscoveryJob, state]);

  return {
    state,
    setState,
    jobId: activeJobId,
    setJobId: setActiveJobId,
    jobContext,
    setJobContext,
    suitability,
    setSuitability,
    workflowError,
    setWorkflowError,
    workflowBusy,
    setWorkflowBusy,
    load,
    assessContext,
  };
}
