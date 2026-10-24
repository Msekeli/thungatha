import { hasClerkConfiguration } from "@/thungatha-features/authentication/server/identity";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { ProfileForm } from "@/thungatha-features/user-profile/ui/profile-form";

export default function ProfilePage() {
  return (
    <WorkspaceShell active="/profile" configured={hasClerkConfiguration()}>
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">
        <ProfileForm />
      </div>
    </WorkspaceShell>
  );
}
