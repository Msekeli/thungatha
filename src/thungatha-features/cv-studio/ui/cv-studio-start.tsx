"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { CvStudioStartView } from "./cv-studio-start-view";
import { useCvStudioData } from "./use-cv-studio-data";
import { useCvStudioJobWorkflow } from "./use-cv-studio-job-workflow";

export function CvStudioStart({ configured = true }: { configured?: boolean }) {
  if (configured) return <AuthenticatedCvStudioStart />;
  return <CvStudioStartContent userId={null} />;
}

function AuthenticatedCvStudioStart() {
  const { userId } = useAuth();
  return <CvStudioStartContent userId={userId} />;
}

function CvStudioStartContent({ userId }: { userId: string | null }) {
  const router = useRouter();
  const data = useCvStudioData(userId);
  const workflow = useCvStudioJobWorkflow({ data, onNavigateToStudio: () => router.replace("/cv-studio") });
  return <CvStudioStartView data={data} workflow={workflow} />;
}
