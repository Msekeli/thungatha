import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { hasClerkConfiguration } from "@/thungatha-features/authentication/server/identity";
import { PublicJobDiscoveryPage } from "@/thungatha-features/job-discovery/ui/public/public-job-discovery-page";

export default async function Home() {
  const configured = hasClerkConfiguration();
  if (configured) {
    const session = await auth();
    if (session.userId) redirect("/jobs?welcome=1");
  }
  return <PublicJobDiscoveryPage configured={configured} />;
}
