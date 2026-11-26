"use client";

import { useState } from "react";
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
  const [mobileTab, setMobileTab] = useState<"details" | "preview">("details");
  const {
    jobForm, setJobForm, reusableCv, setReusableCv, externalJobOpen,
    setExternalJobOpen, tailoringStarted, setTailoringStarted, tailoredPreview,
    handleTailoredContentChange, reuseAcceptedCv, submitPastedJob, clearSelectedJob,
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
        <>
          <nav className="mb-3 grid grid-cols-2 gap-2 rounded-xl bg-panel-2 p-1 lg:hidden" aria-label="Job and CV panels">
            <button type="button" role="tab" aria-selected={mobileTab === "details"} onClick={() => setMobileTab("details")} className={mobileTab === "details" ? "rounded-lg bg-panel px-3 py-2 text-sm font-semibold text-fg shadow-sm" : "rounded-lg px-3 py-2 text-sm text-fg-muted"}>Job details</button>
            <button type="button" role="tab" aria-selected={mobileTab === "preview"} onClick={() => setMobileTab("preview")} className={mobileTab === "preview" ? "rounded-lg bg-panel px-3 py-2 text-sm font-semibold text-fg shadow-sm" : "rounded-lg px-3 py-2 text-sm text-fg-muted"}>CV preview</button>
          </nav>
          <div className="grid min-h-0 min-w-0 flex-1 items-stretch gap-6 lg:h-full lg:grid-cols-[minmax(300px,0.85fr)_minmax(0,1.15fr)]">
            <div className={mobileTab === "details" ? "min-h-0 min-w-0" : "hidden min-h-0 min-w-0 lg:block"}>
              <CvStudioJobDetailsPanel
                jobContext={jobContext}
                suitability={suitability}
                reusableCv={reusableCv}
                busy={workflowBusy}
                error={workflowError}
                onClose={clearSelectedJob}
                onUseVersion={(versionId) => void reuseAcceptedCv(versionId)}
                onStartTailoring={() => setTailoringStarted(true)}
                onReturnToMaster={() => setReusableCv(null)}
              />
            </div>
            <div className={mobileTab === "preview" ? "min-h-0 min-w-0" : "hidden min-h-0 min-w-0 lg:block"}>
              <CvStudioJobPreview
                masterContent={state.masterCv.content}
                reusableCv={reusableCv}
                tailoredPreview={tailoredPreview}
              />
            </div>
          </div>
        </>
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
