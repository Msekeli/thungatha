"use client";

import { useCallback, useEffect, useState } from "react";
import { assessCvStudioJob, loadCvStudio, resolveCvStudioDiscoveryJob } from "./cv-studio-api";
import type { JobContext, State, Suitability } from "./cv-studio-types";

export function useCvStudioData() {
  const [state, setState] = useState<State>({ status: "loading" });
  const [jobId, setJobId] = useState<string | null>(() =>
    typeof window === "undefined"
      ? null
      : new URLSearchParams(window.location.search).get("jobId"),
  );
  const [jobContext, setJobContext] = useState<JobContext | null>(null);
  const [suitability, setSuitability] = useState<Suitability | null>(null);
  const [workflowError, setWorkflowError] = useState<string | null>(null);
  const [workflowBusy, setWorkflowBusy] = useState(false);

  const load = useCallback(async () => {
    setState({ status: "loading" });
    try {
      setState(await loadCvStudio());
    } catch (cause) {
      setState({
        status: "error",
        message: cause instanceof Error ? cause.message : "CV Studio could not load.",
      });
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);

  const assessContext = useCallback(async (
    context: JobContext,
    masterVersionId: string,
  ) => {
    setSuitability(await assessCvStudioJob(masterVersionId, context));
  }, []);

  const resolveDiscoveryJob = useCallback(async (
    selectedJobId: string,
    masterVersionId: string,
  ) => {
    setWorkflowBusy(true);
    setWorkflowError(null);
    setSuitability(null);
    try {
      const body = await resolveCvStudioDiscoveryJob(selectedJobId);
      setJobContext(body.jobContext);
      await assessContext(body.jobContext, masterVersionId);
    } catch (cause) {
      setWorkflowError(
        cause instanceof Error ? cause.message : "The selected job could not be loaded.",
      );
    } finally {
      setWorkflowBusy(false);
    }
  }, [assessContext]);

  useEffect(() => {
    if (state.status !== "master_cv_ready" || !state.masterCv || !jobId || jobContext) return;
    void Promise.resolve().then(() => resolveDiscoveryJob(jobId, state.masterCv!.id));
  }, [state, jobId, jobContext, resolveDiscoveryJob]);

  return {
    state, setState, jobId, setJobId, jobContext, setJobContext,
    suitability, setSuitability, workflowError, setWorkflowError,
    workflowBusy, setWorkflowBusy, load, assessContext,
  };
}
