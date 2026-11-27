"use client";

import { useState } from "react";
import { emptyJobForm } from "./cv-studio-types";
import type { JobForm } from "./cv-studio-types";

export function useCvStudioJobForm(
  setWorkflowError: (message: string | null) => void,
) {
  const [jobForm, setJobForm] = useState<JobForm>(emptyJobForm);
  const [externalJobOpen, setExternalJobOpen] = useState(false);

  function closeExternalJob() {
    setExternalJobOpen(false);
    setWorkflowError(null);
  }

  function resetExternalJob() {
    setExternalJobOpen(false);
    setJobForm(emptyJobForm);
    setWorkflowError(null);
  }

  return {
    jobForm,
    setJobForm,
    externalJobOpen,
    setExternalJobOpen,
    closeExternalJob,
    resetExternalJob,
  };
}
