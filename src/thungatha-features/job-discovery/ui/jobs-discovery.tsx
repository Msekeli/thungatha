"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
      userId={null}
      authReady
      workspaceLeadingColumn={workspaceLeadingColumn}
      showProfileSetupPrompt={showProfileSetupPrompt}
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
  const { isLoaded, isSignedIn, userId } = useAuth();
  return (
    <JobsDiscoveryCore
      configured
      isSignedIn={Boolean(isLoaded && isSignedIn)}
      userId={isLoaded && isSignedIn ? userId : null}
      authReady={isLoaded}
      showProfileSetupPrompt={showProfileSetupPrompt}
      workspaceLeadingColumn={workspaceLeadingColumn}
    />
  );
}

function JobsDiscoveryCore({
  configured,
  isSignedIn,
  userId,
  authReady,
  showProfileSetupPrompt,
  workspaceLeadingColumn,
}: {
  configured: boolean;
  isSignedIn: boolean;
  userId: string | null;
  authReady: boolean;
  showProfileSetupPrompt: boolean;
  workspaceLeadingColumn?: ReactNode;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const state = useJobDiscoveryState(showProfileSetupPrompt, isSignedIn);
  const { setUserSignedIn, setCategory, setPage, setMobileDetail } = state;

  useEffect(() => setUserSignedIn(isSignedIn), [isSignedIn, setUserSignedIn]);
  useEffect(() => {
    const status = searchParams.get("status");
    setCategory(status === "saved" || status === "dismissed" ? status : "new");
    setPage(1);
    setMobileDetail(false);
  }, [searchParams, setCategory, setPage, setMobileDetail]);
  useEffect(() => {
    if (!showProfileSetupPrompt) return;
    window.history.replaceState(null, "", "/jobs");
  }, [showProfileSetupPrompt]);

  const urlStatus = searchParams.get("status");
  const activeCategory =
    urlStatus === "saved" || urlStatus === "dismissed" ? urlStatus : "new";
  const controller = useJobDiscoveryController(
    state,
    userId,
    authReady,
    activeCategory,
  );
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
