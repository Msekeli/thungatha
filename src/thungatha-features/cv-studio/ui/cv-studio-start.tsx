"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { CvPdfContent } from "./cv-pdf-document";
import { cvAccentHex } from "./cv-studio-content-types";
import { emptyJobForm } from "./cv-studio-types";
import type { JobContext, ReusableCv, State, Suitability, JobForm } from "./cv-studio-types";
import { CvStudioWelcomePanel } from "./cv-studio-welcome-panel";
import { CvStudioExternalJobForm } from "./cv-studio-external-job-form";
import { CvStudioStatusPanels } from "./cv-studio-status-panels";
import { CvStudioTailoringWorkspace } from "./cv-studio-tailoring-workspace";
import { CvStudioJobPreview } from "./cv-studio-job-preview";
import { CvStudioMasterPreview } from "./cv-studio-master-preview";
import { CvStudioJobDetailsPanel } from "./cv-studio-job-details-panel";


export function CvStudioStart() {
  const router = useRouter();
  const [state, setState] = useState<State>({ status: "loading" });
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobForm, setJobForm] = useState<JobForm>(emptyJobForm);
  const [jobContext, setJobContext] = useState<JobContext | null>(null);
  const [suitability, setSuitability] = useState<Suitability | null>(null);
  const [reusableCv, setReusableCv] = useState<ReusableCv | null>(null);
  const [workflowError, setWorkflowError] = useState<string | null>(null);
  const [workflowBusy, setWorkflowBusy] = useState(false);
  const [externalJobOpen, setExternalJobOpen] = useState(false);
  const [tailoringStarted, setTailoringStarted] = useState(false);
  const [tailoredPreview, setTailoredPreview] = useState<{
    content: CvPdfContent;
    accent: string;
  } | null>(null);
  const handleTailoredContentChange = useCallback(
    (content: CvPdfContent, accent: string) => {
      setTailoredPreview({ content, accent });
    },
    [],
  );

  const load = useCallback(async () => {
    setState({ status: "loading" });
    try {
      const response = await fetch("/api/cv-studio", { cache: "no-store" });
      const body = await response.json();
      if (!response.ok)
        throw new Error(body.error ?? "CV Studio could not load.");
      setState(body as State);
    } catch (error) {
      setState({
        status: "error",
        message:
          error instanceof Error ? error.message : "CV Studio could not load.",
      });
    }
  }, []);

  useEffect(() => {
    const selectedJobId = new URLSearchParams(window.location.search).get(
      "jobId",
    );
    setJobId(selectedJobId);
    void load();
  }, [load]);

  const assessContext = useCallback(
    async (context: JobContext, masterVersionId: string) => {
      const response = await fetch("/api/cv-studio/suitability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ masterVersionId, jobContext: context }),
      });
      const body = await response.json();
      if (!response.ok)
        throw new Error(
          body.error ?? "The CV recommendation could not be loaded.",
        );
      setSuitability(body as Suitability);
    },
    [],
  );

  const resolveDiscoveryJob = useCallback(
    async (selectedJobId: string, masterVersionId: string) => {
      setWorkflowBusy(true);
      setWorkflowError(null);
      setSuitability(null);
      try {
        const response = await fetch("/api/cv-studio/job-context", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ source: "discovery", jobId: selectedJobId }),
        });
        const body = await response.json();
        if (!response.ok)
          throw new Error(
            body.error ?? "The selected job could not be loaded.",
          );
        const context = body.jobContext as JobContext;
        setJobContext(context);
        await assessContext(context, masterVersionId);
      } catch (error) {
        setWorkflowError(
          error instanceof Error
            ? error.message
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
      !jobId ||
      jobContext
    )
      return;
    void resolveDiscoveryJob(jobId, state.masterCv.id);
  }, [state, jobId, jobContext, resolveDiscoveryJob]);

  async function useAcceptedCv(versionId: string) {
    if (!jobContext) return;
    setWorkflowBusy(true);
    setWorkflowError(null);
    try {
      const response = await fetch("/api/cv-studio/reuse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ versionId, jobContext }),
      });
      const body = await response.json();
      if (!response.ok)
        throw new Error(body.error ?? "The saved CV could not be reused.");
      setReusableCv(body.version as ReusableCv);
    } catch (error) {
      setWorkflowError(
        error instanceof Error
          ? error.message
          : "The saved CV could not be reused.",
      );
    } finally {
      setWorkflowBusy(false);
    }
  }

  async function submitPastedJob(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state.status !== "master_cv_ready" || !state.masterCv) return;
    setWorkflowBusy(true);
    setWorkflowError(null);
    setSuitability(null);
    try {
      const response = await fetch("/api/cv-studio/job-context", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "pasted",
          title: jobForm.title,
          company: jobForm.company,
          description: jobForm.description,
        }),
      });
      const body = await response.json();
      if (!response.ok)
        throw new Error(
          body.error ?? "The job description could not be validated.",
        );
      const context = body.jobContext as JobContext;
      setJobContext(context);
      setExternalJobOpen(false);
      await assessContext(context, state.masterCv.id);
    } catch (error) {
      setWorkflowError(
        error instanceof Error
          ? error.message
          : "The job description could not be validated.",
      );
    } finally {
      setWorkflowBusy(false);
    }
  }

  function clearSelectedJob() {
    setJobId(null);
    setJobContext(null);
    setSuitability(null);
    setReusableCv(null);
    setWorkflowError(null);
    setJobForm(emptyJobForm);
    setExternalJobOpen(false);
    setTailoringStarted(false);
    setTailoredPreview(null);
    router.replace("/cv-studio");
  }

  return (
    <main className="th-cv-studio-page mx-auto h-full min-h-0 w-full max-w-[1600px] overflow-hidden">
      <CvStudioStatusPanels state={state} onRetry={() => void load()} />

      {state.status === "master_cv_ready" && (
        <div className="flex min-h-0 flex-1 flex-col">
          {tailoringStarted && jobContext && state.masterCv ? (
            <CvStudioTailoringWorkspace
              masterVersionId={state.masterCv.id}
              masterContent={state.masterCv.content}
              jobContext={jobContext}
              tailoredPreview={tailoredPreview}
              onContentChange={handleTailoredContentChange}
            />
          ) : jobContext && state.masterCv ? (
            <>
              <div className="grid min-h-0 min-w-0 items-start gap-6 lg:h-full lg:flex-1 lg:grid-cols-[minmax(300px,0.85fr)_minmax(0,1.15fr)] lg:items-stretch">
                <CvStudioJobDetailsPanel
                  jobContext={jobContext}
                  suitability={suitability}
                  reusableCv={reusableCv}
                  busy={workflowBusy}
                  error={workflowError}
                  onClose={clearSelectedJob}
                  onUseVersion={(versionId) => void useAcceptedCv(versionId)}
                  onStartTailoring={() => setTailoringStarted(true)}
                  onReturnToMaster={() => setReusableCv(null)}
                />
                <CvStudioJobPreview
                  masterContent={state.masterCv.content}
                  reusableCv={reusableCv}
                  tailoredPreview={tailoredPreview}
                />
              </div>
            </>
          ) : (
            <div className="grid min-w-0 items-start gap-6 lg:grid-cols-[minmax(280px,0.85fr)_minmax(0,1.15fr)]">
              <section className="min-w-0 rounded-2xl border border-line bg-panel p-5 text-fg shadow-sm sm:p-7">
                {!externalJobOpen ? (
                  <CvStudioWelcomePanel onAddExternalJob={() => setExternalJobOpen(true)} />
                ) : (
                  <CvStudioExternalJobForm
                    value={jobForm}
                    busy={workflowBusy}
                    error={workflowError}
                    hasMasterCv={Boolean(state.masterCv)}
                    onChange={setJobForm}
                    onSubmit={submitPastedJob}
                    onClose={() => {
                      setExternalJobOpen(false);
                      setWorkflowError(null);
                    }}
                    onReset={() => {
                      setExternalJobOpen(false);
                      setJobForm(emptyJobForm);
                      setWorkflowError(null);
                    }}
                  />
                )}
              </section>
              <CvStudioMasterPreview content={state.masterCv} />
            </div>
          )}
        </div>
      )}
    </main>
  );
}
