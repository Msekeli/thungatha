"use client";

import { useRouter } from "next/navigation";
import { CvStudioStartView } from "./cv-studio-start-view";
import { useCvStudioData } from "./use-cv-studio-data";
import { useCvStudioJobWorkflow } from "./use-cv-studio-job-workflow";

export function CvStudioStart() {
  const router = useRouter();
  const data = useCvStudioData();
  const workflow = useCvStudioJobWorkflow({
    data,
    onNavigateToStudio: () => router.replace("/cv-studio"),
  });

  return <CvStudioStartView data={data} workflow={workflow} />;
}
