"use client";

import { CvStudioTailoringWorkspace } from "./cv-studio-tailoring-workspace";
import { CvStudioJobPreview } from "./cv-studio-job-preview";
import { CvStudioJobDetailsPanel } from "./cv-studio-job-details-panel";
import type { JobContext, Suitability, State } from "./cv-studio-types";
import type { useCvStudioJobWorkflow } from "./use-cv-studio-job-workflow";
import { CvStudioJobEntryView } from "./cv-studio-job-entry-view";

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
        <CvStudioJobEntryView
          masterContent={state.masterCv?.content ?? null}
          jobForm={jobForm}
          busy={workflowBusy}
          error={workflowError}
          externalJobOpen={externalJobOpen}
          onFormChange={setJobForm}
          onSubmit={submitPastedJob}
          onClose={closeExternalJob}
          onReset={resetExternalJob}
          onAddExternalJob={() => setExternalJobOpen(true)}
        />
      )}
    </div>
  );
}
