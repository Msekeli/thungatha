"use client";

import { useCallback, useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { readWorkspaceCache, writeWorkspaceCache } from "@/lib/workspace-data-cache";
import { assessCvStudioJob, loadCvStudio, resolveCvStudioDiscoveryJob } from "./cv-studio-api";
import type { JobContext, State, Suitability } from "./cv-studio-types";

const CV_STUDIO_CACHE_KEY = "cv-studio";
const CV_STUDIO_CACHE_TTL = 2 * 60 * 1000;

export function useCvStudioData(userId: string | null, enabled = true) {
  const cached = readWorkspaceCache<State>(userId, CV_STUDIO_CACHE_KEY, CV_STUDIO_CACHE_TTL);
  const [state, setStateInternal] = useState<State>(cached?.value ?? { status: "loading" });
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobContext, setJobContext] = useState<JobContext | null>(null);
  const [suitability, setSuitability] = useState<Suitability | null>(null);
  const [workflowError, setWorkflowError] = useState<string | null>(null);
  const [workflowBusy, setWorkflowBusy] = useState(false);

  const setState: Dispatch<SetStateAction<State>> = useCallback((next) => {
    setStateInternal(current => {
      const resolved = typeof next === "function" ? (next as (value: State) => State)(current) : next;
      if (resolved.status !== "loading" && resolved.status !== "error") {
        writeWorkspaceCache(userId, CV_STUDIO_CACHE_KEY, resolved);
      }
      return resolved;
    });
  }, [userId]);

  const load = useCallback(async (force = false) => {
    const current = readWorkspaceCache<State>(userId, CV_STUDIO_CACHE_KEY, CV_STUDIO_CACHE_TTL);
    if (!force && current) {
      setState(current.value);
      if (current.fresh) return;
    } else if (!current) {
      setState({ status: "loading" });
    }
    try { setState(await loadCvStudio()); }
    catch (cause) {
      setState({ status: "error", message: cause instanceof Error ? cause.message : "CV Studio could not load." });
    }
  }, [setState, userId]);

  useEffect(() => {
    const selectedJobId = new URLSearchParams(window.location.search).get("jobId");
    setJobId(selectedJobId);
    if (enabled) void load();
  }, [load, enabled]);

  const assessContext = useCallback(async (context: JobContext, masterVersionId: string) => {
    setSuitability(await assessCvStudioJob(masterVersionId, context));
  }, []);

  const resolveDiscoveryJob = useCallback(async (selectedJobId: string, masterVersionId: string) => {
    setWorkflowBusy(true); setWorkflowError(null); setSuitability(null);
    try {
      const body = await resolveCvStudioDiscoveryJob(selectedJobId);
      setJobContext(body.jobContext);
      await assessContext(body.jobContext, masterVersionId);
    } catch (cause) {
      setWorkflowError(cause instanceof Error ? cause.message : "The selected job could not be loaded.");
    } finally { setWorkflowBusy(false); }
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
