"use client";


import { useRouter } from "next/navigation";
import { cvAccentHex } from "./cv-studio-content-types";
import { CvStudioWelcomePanel } from "./cv-studio-welcome-panel";
import { CvStudioExternalJobForm } from "./cv-studio-external-job-form";
import { CvStudioStatusPanels } from "./cv-studio-status-panels";
import { CvStudioTailoringWorkspace } from "./cv-studio-tailoring-workspace";
import { CvStudioJobPreview } from "./cv-studio-job-preview";
import { CvStudioMasterPreview } from "./cv-studio-master-preview";
import { CvStudioJobDetailsPanel } from "./cv-studio-job-details-panel";
import { useCvStudioData } from "./use-cv-studio-data";
import { useCvStudioJobWorkflow } from "./use-cv-studio-job-workflow";


export function CvStudioStart() {
  const router = useRouter();
  const data = useCvStudioData();
  const workflow = useCvStudioJobWorkflow({
    data,
    onNavigateToStudio: () => router.replace("/cv-studio"),
  });
  const {
    state, jobContext, suitability, workflowError, workflowBusy, load,
  } = data;
  const {
    jobForm, setJobForm, reusableCv, setReusableCv, externalJobOpen,
    setExternalJobOpen, tailoringStarted, setTailoringStarted, tailoredPreview,
    handleTailoredContentChange, useAcceptedCv, submitPastedJob, clearSelectedJob,
  } = workflow;

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
