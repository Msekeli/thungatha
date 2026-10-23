import { Suspense } from "react";
import { hasClerkConfiguration } from "@/thungatha-features/authentication/server/identity";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import JobsDiscovery from "@/thungatha-features/job-discovery/ui/jobs-discovery";

type PageProps = { searchParams: Promise<{ welcome?: string | string[] }> };

export default function Page({ searchParams }: PageProps) {
  return (
    <WorkspaceShell active="/jobs" configured={hasClerkConfiguration()}>
      <div className="th-jobs-page th-jobs-page--app th-jobs-redesign mx-auto box-border flex min-h-0 w-[min(calc(100%-40px),1600px)] max-w-full flex-1 flex-col py-[18px] max-[900px]:h-full max-[900px]:w-full max-[900px]:p-0">
        <Suspense fallback={null}>
          <JobsDiscoveryWithWelcome searchParams={searchParams} />
        </Suspense>
      </div>
    </WorkspaceShell>
  );
}

async function JobsDiscoveryWithWelcome({ searchParams }: PageProps) {
  const params = await searchParams;
  const welcome = Array.isArray(params.welcome)
    ? params.welcome.includes("1")
    : params.welcome === "1";
  return (
    <JobsDiscovery
      configured={hasClerkConfiguration()}
      showProfileSetupPrompt={welcome}
    />
  );
}
