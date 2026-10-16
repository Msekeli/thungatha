import { hasClerkConfiguration } from "@/lib/auth/identity";
import JobsDiscovery from "@/components/jobs/jobs-discovery";

export default function Page() {
  return <JobsDiscovery configured={hasClerkConfiguration()} />;
}
