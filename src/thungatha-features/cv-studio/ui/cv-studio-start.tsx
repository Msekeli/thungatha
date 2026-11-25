"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { jobDescriptionToText } from "@/thungatha-features/job-discovery/server/job-requirement-text";
import { CvPdfPreview } from "./cv-pdf-preview";
import type { CvPdfContent } from "./cv-pdf-document";
import { cvAccentHex } from "./cv-studio-content-types";
import { emptyJobForm } from "./cv-studio-types";
import type { JobContext, ReusableCv, State, Suitability, JobForm } from "./cv-studio-types";
import { CvDraftEditor } from "./cv-draft-editor";
import { CvStudioPreviewPanel } from "./cv-studio-preview-panel";
import { CvStudioWelcomePanel } from "./cv-studio-welcome-panel";
import { CvStudioExternalJobForm } from "./cv-studio-external-job-form";


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
      {state.status === "loading" && (
        <section
          className="rounded-2xl border border-slate-200 bg-white p-6"
          aria-live="polite"
        >
          Checking your Profile and CV versions…
        </section>
      )}

      {state.status === "error" && (
        <section
          className="rounded-2xl border border-rose-200 bg-rose-50 p-6"
          role="alert"
        >
          <h2 className="font-semibold text-rose-900">
            CV Studio could not load
          </h2>
          <p className="mt-2 text-sm text-rose-800">{state.message}</p>
          <Button
            className="mt-4"
            variant="outline"
            onClick={() => void load()}
          >
            Try again
          </Button>
        </section>
      )}

      {state.status === "profile_required" && (
        <section className="grid gap-6 rounded-2xl border border-amber-200 bg-amber-50 p-6 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <h2 className="text-lg font-semibold text-amber-950">
              {state.confirmed
                ? "Your Profile needs more information"
                : "Complete and confirm your Profile first"}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-amber-900">
              CV Studio uses confirmed Profile information as its only source of
              candidate facts. Complete the missing information and confirm your
              Profile before generating a CV.
            </p>
            {state.missing.length > 0 && (
              <ul className="mt-4 list-inside list-disc space-y-1 text-sm text-amber-950">
                {state.missing.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
          </div>
          <ButtonLink href="/profile">Complete Profile</ButtonLink>
        </section>
      )}

      {state.status === "master_cv_ready" && (
        <div className="flex min-h-0 flex-1 flex-col">
          {tailoringStarted && jobContext && state.masterCv ? (
            <div className="grid h-full min-h-0 min-w-0 flex-1 grid-cols-1 gap-3 overflow-hidden lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-3">
              <div className="min-h-0 min-w-0">
                <CvDraftEditor
                  masterVersionId={state.masterCv.id}
                  onContentChange={handleTailoredContentChange}
                  jobContext={jobContext}
                  initialContent={state.masterCv.content}
                  startImmediately
                />
              </div>
              <section className="hidden min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl border border-line bg-panel p-3 text-fg shadow-sm lg:flex">
                <CvStudioPreviewPanel
                  masterContent={state.masterCv.content}
                  tailoredPreview={tailoredPreview}
                />
              </section>
            </div>
          ) : jobContext && state.masterCv ? (
            <>
              <div className="grid min-h-0 min-w-0 items-start gap-6 lg:h-full lg:flex-1 lg:grid-cols-[minmax(300px,0.85fr)_minmax(0,1.15fr)] lg:items-stretch">
                <section className="min-w-0 space-y-4 lg:h-full lg:overflow-y-auto lg:pr-2">
                  <div className="rounded-2xl border border-line bg-panel p-4 text-fg shadow-sm sm:p-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-wide text-accent-text">
                          {jobContext.source === "discovery"
                            ? "Job from Thungatha Discovery"
                            : "External job opportunity"}
                        </p>
                        <h2 className="mt-2 break-words text-xl font-semibold text-fg">
                          {jobContext.title}
                        </h2>
                        <p className="mt-1 text-sm text-fg-muted">
                          {[jobContext.company, jobContext.location]
                            .filter(Boolean)
                            .join(" · ") || "Company/location not supplied"}
                        </p>
                      </div>
                      <div className="flex w-full flex-wrap gap-2 sm:w-auto">
                        <Button
                          className="w-full shrink-0 whitespace-normal sm:w-auto"
                          variant="outline"
                          size="sm"
                          onClick={clearSelectedJob}
                        >
                          Close job
                        </Button>
                      </div>
                    </div>
                    <div className="mt-5 border-t border-line pt-4">
                      <h3 className="text-sm font-semibold text-fg">
                        Job description
                      </h3>
                      <div className="mt-2 h-[35dvh] min-h-[10rem] max-h-[22rem] overflow-y-auto overscroll-contain whitespace-pre-line rounded-lg border border-line bg-panel-2 p-4 pr-3 text-sm leading-6 text-fg-muted lg:h-[50dvh] lg:min-h-[12rem] lg:max-h-[50dvh]">
                        {jobDescriptionToText(jobContext.description)}
                      </div>
                    </div>
                    <div
                      className="mt-4 rounded-xl border border-line bg-panel-2 p-3"
                      aria-live="polite"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs font-semibold uppercase tracking-wide text-fg-muted">
                          CV for this job
                        </p>
                        {workflowBusy && (
                          <span className="text-xs text-fg-muted">
                            Checking saved CVs…
                          </span>
                        )}
                        {suitability?.matchingVersions.length ? (
                          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600">
                            Existing CV available
                          </span>
                        ) : null}
                        {suitability && !suitability.matchingVersions.length ? (
                          <span className="rounded-full border border-line px-2.5 py-1 text-xs font-medium text-fg-muted">
                            No existing CV for this exact job
                          </span>
                        ) : null}
                      </div>
                      {suitability?.matchingVersions.map((version) => (
                        <div
                          key={version.id}
                          className="mt-2 flex flex-wrap items-center justify-between gap-2"
                        >
                          <div>
                            <p className="text-sm font-medium text-fg">
                              Accepted CV · Version {version.versionNumber}
                            </p>
                            <p className="text-xs text-fg-muted">
                              Updated{" "}
                              {new Date(version.updatedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={workflowBusy}
                            onClick={() => void useAcceptedCv(version.id)}
                          >
                            Use saved CV for this job
                          </Button>
                        </div>
                      ))}
                      {workflowError && (
                        <p className="mt-2 text-sm text-rose-700" role="alert">
                          {workflowError}
                        </p>
                      )}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {!reusableCv && !tailoringStarted && (
                        <Button
                          size="lg"
                          className="mx-auto w-[98%] rounded-md"
                          disabled={workflowBusy}
                          onClick={() => setTailoringStarted(true)}
                        >
                          <span className="font-bold">
                            Create a new CV tailored to this job
                          </span>
                        </Button>
                      )}
                      {tailoringStarted && (
                        <p className="w-full rounded-lg border border-accent/30 bg-accent-bg/40 px-3 py-2 text-center text-sm font-medium text-accent-text">
                          CV tailoring workspace is open below.
                        </p>
                      )}
                      {reusableCv && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setReusableCv(null)}
                        >
                          Return to master CV
                        </Button>
                      )}
                    </div>
                  </div>

                  {tailoringStarted && !reusableCv && (
                    <CvDraftEditor
                      masterVersionId={state.masterCv.id}
                      onContentChange={handleTailoredContentChange}
                      jobContext={jobContext}
                      initialContent={state.masterCv.content}
                      startImmediately
                    />
                  )}
                </section>
                <section className="hidden min-w-0 rounded-2xl border border-line bg-panel p-3 text-fg shadow-sm sm:p-4 lg:block lg:h-full lg:overflow-y-auto">
                  {reusableCv ? (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-fg">
                        Reusing accepted CV · Version{" "}
                        {reusableCv.version_number}
                      </p>
                      <CvPdfPreview
                        content={reusableCv.content}
                        accent={cvAccentHex[reusableCv.accent_colour]}
                      />
                    </div>
                  ) : (
                    <CvPdfPreview
                      content={
                        tailoredPreview?.content ?? state.masterCv.content
                      }
                      accent={tailoredPreview?.accent}
                    />
                  )}
                </section>
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
              <section className="hidden min-w-0 rounded-2xl border border-line bg-panel p-3 text-fg shadow-sm sm:p-4 lg:block">
                {state.masterCv ? (
                  <CvPdfPreview content={state.masterCv.content} />
                ) : (
                  <p className="text-sm text-fg-muted">
                    Your master CV is being prepared.
                  </p>
                )}
              </section>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
