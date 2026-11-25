"use client";

import { useCallback, useState, type FormEvent } from "react";
import { createCvStudioPastedJob, reuseCvStudioVersion } from "./cv-studio-api";
import type { ReusableCv } from "./cv-studio-content-types";
import type { CvPdfContent } from "./cv-pdf-document";
import type { useCvStudioData } from "./use-cv-studio-data";
import { useCvStudioJobForm } from "./use-cv-studio-job-form";

type CvStudioJobWorkflowProps = {
  data: ReturnType<typeof useCvStudioData>;
  onNavigateToStudio: () => void;
};

export function useCvStudioJobWorkflow({
  data, onNavigateToStudio,
}: CvStudioJobWorkflowProps) {
  const [reusableCv, setReusableCv] = useState<ReusableCv | null>(null);
  const [tailoringStarted, setTailoringStarted] = useState(false);
  const { jobForm, setJobForm, externalJobOpen, setExternalJobOpen, closeExternalJob, resetExternalJob } = useCvStudioJobForm(data.setWorkflowError);
  const [tailoredPreview, setTailoredPreview] = useState<{
    content: CvPdfContent;
    accent: string;
  } | null>(null);

  const handleTailoredContentChange = useCallback(
    (content: CvPdfContent, accent: string) => setTailoredPreview({ content, accent }),
    [],
  );

  async function useAcceptedCv(versionId: string) {
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

  async function submitPastedJob(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (data.state.status !== "master_cv_ready" || !data.state.masterCv) return;
    data.setWorkflowBusy(true);
    data.setWorkflowError(null);
    data.setSuitability(null);
    try {
      const body = await createCvStudioPastedJob(jobForm);
      data.setJobContext(body.jobContext);
      setExternalJobOpen(false);
      await data.assessContext(body.jobContext, data.state.masterCv.id);
    } catch (cause) {
      data.setWorkflowError(
        cause instanceof Error ? cause.message : "The job description could not be validated.",
      );
    } finally {
      data.setWorkflowBusy(false);
    }
  }

  function clearSelectedJob() {
    data.setJobId(null);
    data.setJobContext(null);
    data.setSuitability(null);
    setReusableCv(null);
    data.setWorkflowError(null);
    setJobForm(emptyJobForm);
    setExternalJobOpen(false);
    setTailoringStarted(false);
    setTailoredPreview(null);
    onNavigateToStudio();
  }

  return {
    ...useCvStudioJobForm(data.setWorkflowError),
    reusableCv, setReusableCv, tailoringStarted, setTailoringStarted,
    tailoredPreview, handleTailoredContentChange, useAcceptedCv,
    submitPastedJob, clearSelectedJob,
  };
}
