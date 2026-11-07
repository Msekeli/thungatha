import { hasClerkConfiguration } from "@/thungatha-features/authentication/server/identity";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { ProfileForm } from "@/thungatha-features/user-profile/ui/profile-form";

export default function ProfilePage() {
  return (
    <WorkspaceShell active="/profile" configured={hasClerkConfiguration()}>
      <div className="th-profile-page w-full min-w-0 max-w-none px-3 sm:px-4 lg:px-6">
        <div className="th-profile-form-scroll">
          <div className="py-6">
            <ProfileForm />
          </div>
        </div>
      </div>
    </WorkspaceShell>
  );
}
