import { hasClerkConfiguration } from "@/thungatha-features/authentication/server/identity";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { JobTrackingDashboard } from "@/thungatha-features/job-tracking/ui/job-tracking-dashboard";

export default function Page() {
  return (
    <WorkspaceShell active="/job-tracking" configured={hasClerkConfiguration()}>
      <JobTrackingDashboard />
    </WorkspaceShell>
  );
}
