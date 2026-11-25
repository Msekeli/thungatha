"use client";

import { CvStudioWelcomePanel } from "./cv-studio-welcome-panel";
import { CvStudioExternalJobForm } from "./cv-studio-external-job-form";
import { CvStudioTailoringWorkspace } from "./cv-studio-tailoring-workspace";
import { CvStudioJobPreview } from "./cv-studio-job-preview";
import { CvStudioMasterPreview } from "./cv-studio-master-preview";
import { CvStudioJobDetailsPanel } from "./cv-studio-job-details-panel";
import type { CvPdfContent } from "./cv-pdf-document";
import type { JobContext, Suitability, JobForm, State } from "./cv-studio-types";
import type { useCvStudioJobWorkflow } from "./use-cv-studio-job-workflow";

type MasterReadyState = Extract<State, { status: "master_cv_ready" }>;
type MasterReadyViewProps = {
  state: MasterReadyState;
  jobContext: JobContext | null;
  suitability: Suitability | null;
  workflowBusy: boolean;
  workflowError: string | null;
  workflow: ReturnType<typeof useCvStudioJobWorkflow>;
};

export function CvStudioMasterReadyView({
  state, jobContext, suitability, workflowBusy, workflowError, workflow,
}: MasterReadyViewProps) {
  const {
    jobForm, setJobForm, reusableCv, setReusableCv, externalJobOpen,
    setExternalJobOpen, tailoringStarted, setTailoringStarted, tailoredPreview,
    handleTailoredContentChange, useAcceptedCv, submitPastedJob, clearSelectedJob,
    closeExternalJob, resetExternalJob,
  } = workflow;

  return (
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
      ) : (
        <div className="grid min-w-0 items-start gap-6 lg:grid-cols-[minmax(280px,0.85fr)_minmax(0,1.15fr)]">
          <section className="min-w-0 rounded-2xl border border-line bg-panel p-5 text-fg shadow-sm sm:p-7">
            {externalJobOpen ? (
              <CvStudioExternalJobForm
                value={jobForm}
                busy={workflowBusy}
                error={workflowError}
                hasMasterCv={Boolean(state.masterCv)}
                onChange={setJobForm}
                onSubmit={submitPastedJob}
                onClose={closeExternalJob}
                onReset={resetExternalJob}
              />
            ) : (
              <CvStudioWelcomePanel onAddExternalJob={() => setExternalJobOpen(true)} />
            )}
          </section>
          <CvStudioMasterPreview content={state.masterCv} />
        </div>
      )}
    </div>
  );
}
