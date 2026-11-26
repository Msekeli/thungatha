import { hasClerkConfiguration } from "@/thungatha-features/authentication/server/identity";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { CvStudioStart } from "@/thungatha-features/cv-studio/ui/cv-studio-start";

export default function Page() {
  const configured = hasClerkConfiguration();
  return (
    <WorkspaceShell active="/cv-studio" configured={configured}>
      <CvStudioStart configured={configured} />
    </WorkspaceShell>
  );
}
