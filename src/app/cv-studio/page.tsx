import { hasClerkConfiguration } from "@/thungatha-features/authentication/server/identity";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { CvStudioStart } from "@/thungatha-features/cv-studio/ui/cv-studio-start";

type PageProps = {
  searchParams: Promise<{ jobId?: string | string[] }>;
};

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const jobId = Array.isArray(params.jobId)
    ? (params.jobId[0] ?? null)
    : (params.jobId ?? null);
  const configured = hasClerkConfiguration();
  return (
    <WorkspaceShell active="/cv-studio" configured={configured}>
      <CvStudioStart />
    </WorkspaceShell>
  );
}
