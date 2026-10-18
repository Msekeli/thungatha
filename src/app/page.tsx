import { hasClerkConfiguration } from "@/lib/auth/identity";
import PublicJobDiscovery from "@/components/jobs/public-job-discovery";

export default function Home() {
  return <PublicJobDiscovery configured={hasClerkConfiguration()} />;
}
