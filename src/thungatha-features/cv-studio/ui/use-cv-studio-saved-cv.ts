"use client";

import { useState } from "react";
import { reuseCvStudioVersion } from "./cv-studio-api";
import type { ReusableCv } from "./cv-studio-content-types";
import type { useCvStudioData } from "./use-cv-studio-data";

export function useCvStudioSavedCv(data: ReturnType<typeof useCvStudioData>) {
  const [reusableCv, setReusableCv] = useState<ReusableCv | null>(null);

  async function reuseAcceptedCv(versionId: string) {
    if (!data.jobContext) return;
    data.setWorkflowBusy(true);
    data.setWorkflowError(null);
    try {
      const body = await reuseCvStudioVersion(versionId, data.jobContext);
      setReusableCv(body.version);
    } catch (cause) {
      data.setWorkflowError(
        cause instanceof Error ? cause.message : "The saved CV could not be reused.",
      );
    } finally {
      data.setWorkflowBusy(false);
    }
  }

  return { reusableCv, setReusableCv, reuseAcceptedCv };
}
