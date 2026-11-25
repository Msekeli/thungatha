import { hasClerkConfiguration } from "@/thungatha-features/authentication/server/identity";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { ProfileForm } from "@/thungatha-features/user-profile/ui/profile-form";

export default function ProfilePage() {
  return (
    <WorkspaceShell active="/profile" configured={hasClerkConfiguration()}>
      <div className="th-profile-page box-border flex h-full max-h-full min-h-0 min-w-0 w-full max-w-none flex-1 flex-col overflow-hidden px-3 sm:px-4 lg:px-6">
        <div className="th-profile-form-scroll flex min-h-0 min-w-0 w-full flex-1 flex-col overflow-hidden has-[.th-profile-form-state--view]:overflow-y-auto has-[.th-profile-form-state--view]:overscroll-y-contain has-[.th-profile-form-state--view]:[scrollbar-gutter:stable] has-[.th-profile-form-state--view]:[-webkit-overflow-scrolling:touch]">
          <div className="flex min-h-0 min-w-0 w-full flex-1 flex-col pt-3 pb-3 max-[700px]:pt-2 max-[700px]:pb-0">
            <ProfileForm />
          </div>
        </div>
      </div>
    </WorkspaceShell>
  );
}
