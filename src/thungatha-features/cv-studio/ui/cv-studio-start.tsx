"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { CvStudioStartView } from "./cv-studio-start-view";
import { useCvStudioData } from "./use-cv-studio-data";
import { useCvStudioJobWorkflow } from "./use-cv-studio-job-workflow";

export function CvStudioStart({
  configured = true,
  jobId = null,
}: {
  configured?: boolean;
  jobId?: string | null;
}) {
  if (configured) return <AuthenticatedCvStudioStart jobId={jobId} />;
  return <CvStudioStartContent userId={null} enabled jobId={jobId} />;
}

function AuthenticatedCvStudioStart({ jobId }: { jobId: string | null }) {
  const { userId, isLoaded } = useAuth();
  return (
    <CvStudioStartContent
      userId={userId ?? null}
      enabled={isLoaded}
      jobId={jobId}
    />
  );
}

function CvStudioStartContent({
  userId,
  enabled,
  jobId,
}: {
  userId: string | null;
  enabled: boolean;
  jobId: string | null;
}) {
  const router = useRouter();
  const data = useCvStudioData(userId, enabled, jobId);
  const workflow = useCvStudioJobWorkflow({
    data,
    onNavigateToStudio: () => router.replace("/cv-studio"),
  });
  return <CvStudioStartView data={data} workflow={workflow} />;
}
