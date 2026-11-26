"use client";

import { CvStudioStatusPanels } from "./cv-studio-status-panels";
import type { useCvStudioData } from "./use-cv-studio-data";
import type { useCvStudioJobWorkflow } from "./use-cv-studio-job-workflow";
import { CvStudioMasterReadyView } from "./cv-studio-master-ready-view";

export function CvStudioStartView({
  data,
  workflow,
}: {
  data: ReturnType<typeof useCvStudioData>;
  workflow: ReturnType<typeof useCvStudioJobWorkflow>;
}) {
  const { state, load } = data;

  return (
    <main className="th-cv-studio-page mx-auto box-border flex h-full min-h-0 w-full max-w-[1600px] flex-1 flex-col overflow-hidden px-6 py-3 max-[700px]:px-2 max-[700px]:pt-2 max-[700px]:pb-[calc(8px+env(safe-area-inset-bottom))]">
      <CvStudioStatusPanels state={state} onRetry={() => void load()} />
      {state.status === "master_cv_ready" && (
        <CvStudioMasterReadyView
          state={state}
          jobContext={data.jobContext}
          suitability={data.suitability}
          workflowBusy={data.workflowBusy}
          workflowError={data.workflowError}
          workflow={workflow}
        />
      )}
    </main>
  );
}
