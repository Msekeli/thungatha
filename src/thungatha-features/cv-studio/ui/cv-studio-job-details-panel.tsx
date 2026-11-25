"use client";

import { CvStudioJobDescriptionPanel } from "./cv-studio-job-description-panel";
import { CvStudioSuitabilityPanel } from "./cv-studio-suitability-panel";
import { CvStudioJobActions } from "./cv-studio-job-actions";
import type { JobContext, Suitability } from "./cv-studio-types";
import type { ReusableCv } from "./cv-studio-content-types";

export function CvStudioJobDetailsPanel({
  jobContext, suitability, reusableCv, busy, error,
  onClose, onUseVersion, onStartTailoring, onReturnToMaster,
}: {
  jobContext: JobContext;
  suitability: Suitability | null;
  reusableCv: ReusableCv | null;
  busy: boolean;
  error: string | null;
  onClose: () => void;
  onUseVersion: (id: string) => void;
  onStartTailoring: () => void;
  onReturnToMaster: () => void;
}) {
  return (
    <section className="min-w-0 space-y-4 lg:h-full lg:overflow-y-auto lg:pr-2">
      <CvStudioJobDescriptionPanel jobContext={jobContext} onClose={onClose} />
      <CvStudioSuitabilityPanel
        suitability={suitability}
        busy={busy}
        error={error}
        onUseVersion={onUseVersion}
      />
      <CvStudioJobActions
        reusableCv={reusableCv}
        busy={busy}
        onStartTailoring={onStartTailoring}
        onReturnToMaster={onReturnToMaster}
      />
    </section>
  );
}
