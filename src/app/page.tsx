import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { hasClerkConfiguration } from "@/lib/auth/identity";
import PublicJobDiscovery from "@/thungatha-features/jobs/ui/public-job-discovery";

export default async function Home() {
  const configured = hasClerkConfiguration();
  if (configured) {
    const session = await auth();
    if (session.userId) redirect("/jobs?welcome=1");
  }
  return <PublicJobDiscovery configured={configured} />;
}
