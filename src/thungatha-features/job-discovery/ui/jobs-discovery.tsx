"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useJobDiscoveryState } from "./hooks/use-job-discovery-state";
import { useJobDiscoveryController } from "./hooks/use-job-discovery-controller";
import { JobDiscoveryScreen } from "./shared/job-discovery-screen";

export default function JobsDiscovery({
  configured,
  showProfileSetupPrompt = false,
  workspaceLeadingColumn,
}: {
  configured: boolean;
  showProfileSetupPrompt?: boolean;
  workspaceLeadingColumn?: ReactNode;
}) {
  if (configured)
    return (
      <ClerkJobsDiscovery
        showProfileSetupPrompt={showProfileSetupPrompt}
        workspaceLeadingColumn={workspaceLeadingColumn}
      />
    );
  return (
    <JobsDiscoveryCore
      configured={false}
      isSignedIn={false}
      showProfileSetupPrompt={showProfileSetupPrompt}
      workspaceLeadingColumn={workspaceLeadingColumn}
    />
  );
}

function ClerkJobsDiscovery({
  showProfileSetupPrompt,
  workspaceLeadingColumn,
}: {
  showProfileSetupPrompt: boolean;
  workspaceLeadingColumn?: ReactNode;
}) {
  const { isLoaded, isSignedIn } = useAuth();
  return (
    <JobsDiscoveryCore
      configured
      isSignedIn={Boolean(isLoaded && isSignedIn)}
      showProfileSetupPrompt={showProfileSetupPrompt}
      workspaceLeadingColumn={workspaceLeadingColumn}
    />
  );
}

function JobsDiscoveryCore({
  configured,
  isSignedIn,
  showProfileSetupPrompt,
  workspaceLeadingColumn,
}: {
  configured: boolean;
  isSignedIn: boolean;
  showProfileSetupPrompt: boolean;
  workspaceLeadingColumn?: ReactNode;
}) {
  const router = useRouter();
  const state = useJobDiscoveryState(showProfileSetupPrompt, isSignedIn);
  const { setUserSignedIn } = state;
  useEffect(() => setUserSignedIn(isSignedIn), [isSignedIn, setUserSignedIn]);

  useEffect(() => {
    if (!showProfileSetupPrompt) return;
    // Remove the one-time prompt flag without triggering a Next.js RSC navigation.
    window.history.replaceState(null, "", "/jobs");
  }, [showProfileSetupPrompt]);

  const controller = useJobDiscoveryController(state);

  return (
    <JobDiscoveryScreen
      configured={configured}
      state={state}
      controller={controller}
      routerPushProfile={() => router.push("/profile")}
      workspaceLeadingColumn={workspaceLeadingColumn}
    />
  );
}
