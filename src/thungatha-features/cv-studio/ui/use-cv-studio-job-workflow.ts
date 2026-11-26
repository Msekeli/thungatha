"use client";

import { useCallback, useState, type FormEvent } from "react";
import { createCvStudioPastedJob } from "./cv-studio-api";
import type { CvPdfContent } from "./cv-pdf-document";
import type { useCvStudioData } from "./use-cv-studio-data";
import { useCvStudioJobForm } from "./use-cv-studio-job-form";
import { useCvStudioSavedCv } from "./use-cv-studio-saved-cv";

type CvStudioJobWorkflowProps = {
  data: ReturnType<typeof useCvStudioData>;
  onNavigateToStudio: () => void;
};

export function useCvStudioJobWorkflow({
  data,
  onNavigateToStudio,
}: CvStudioJobWorkflowProps) {
  const savedCv = useCvStudioSavedCv(data);
  const [tailoringStarted, setTailoringStarted] = useState(false);
  const jobFormState = useCvStudioJobForm(data.setWorkflowError);
  const { jobForm, setExternalJobOpen, resetExternalJob } = jobFormState;
  const [tailoredPreview, setTailoredPreview] = useState<{
    content: CvPdfContent;
    accent: string;
  } | null>(null);

  const handleTailoredContentChange = useCallback(
    (content: CvPdfContent, accent: string) =>
      setTailoredPreview({ content, accent }),
    [],
  );

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
        cause instanceof Error
          ? cause.message
          : "The job description could not be validated.",
      );
    } finally {
      data.setWorkflowBusy(false);
    }
  }

  function clearSelectedJob() {
    data.setJobId(null);
    data.setJobContext(null);
    data.setSuitability(null);
    savedCv.setReusableCv(null);
    data.setWorkflowError(null);
    resetExternalJob();
    setTailoringStarted(false);
    setTailoredPreview(null);
    onNavigateToStudio();
  }

  return {
    ...jobFormState,
    ...savedCv,
    tailoringStarted,
    setTailoringStarted,
    tailoredPreview,
    handleTailoredContentChange,
    submitPastedJob,
    clearSelectedJob,
  };
}
