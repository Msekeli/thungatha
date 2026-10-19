import { hasClerkConfiguration } from "@/thungatha-features/authentication/server/identity";
import JobsDiscovery from "@/thungatha-features/job-discovery/ui/authenticated/jobs-discovery";

type PageProps = { searchParams: Promise<{ welcome?: string | string[] }> };

export default async function Page({ searchParams }: PageProps) {
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
