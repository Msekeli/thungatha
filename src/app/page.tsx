import { redirect } from "next/navigation";
import { getAuthenticatedIdentity, hasClerkConfiguration } from "@/lib/auth/identity";
import PublicJobDiscovery from "@/components/jobs/public-job-discovery";

export default async function Home() {
  const configured = hasClerkConfiguration();
  if (configured) {
    const identity = await getAuthenticatedIdentity();
    if (identity) redirect("/jobs");
  }
  return <PublicJobDiscovery configured={configured} />;
}
