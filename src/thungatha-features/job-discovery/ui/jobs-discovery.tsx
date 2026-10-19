"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import "./jobs-discovery.css";
import { useJobDiscoveryState } from "./hooks/use-job-discovery-state";
import { useJobDiscoveryController } from "./hooks/use-job-discovery-controller";
import { JobDiscoveryScreen } from "./authenticated/job-discovery-screen";


export default function JobsDiscovery({
  configured,
  showProfileSetupPrompt = false,
}: {
  configured: boolean;
  showProfileSetupPrompt?: boolean;
}) {
  const router = useRouter();
  const state = useJobDiscoveryState(showProfileSetupPrompt);

  useEffect(() => {
    if (!showProfileSetupPrompt) return;
    // Remove the one-time prompt flag without triggering a Next.js RSC navigation.
    window.history.replaceState(null, "", "/jobs");
  }, [showProfileSetupPrompt]);

  const controller = useJobDiscoveryController(state);
  const {
    updateJobState, undoLastStateChange, selectedDetail, selectedSource,
    selectedActivity, applicationUrl, jobSourceUrl, applicationDestination,
    hasFilters, visibleJobs, categories, openApplicationLink, confirmApplied,
    changeDraft, submitFilters, clearFilters,
  } = controller;

  return <JobDiscoveryScreen configured={configured} state={state} controller={controller} routerPushProfile={() => router.push("/profile")} />;
}
