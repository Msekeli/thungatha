import { hasClerkConfiguration } from "@/thungatha-features/authentication/server/identity";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { ProfileForm } from "@/thungatha-features/user-profile/ui/profile-form";

export default function ProfilePage() {
  return (
    <WorkspaceShell active="/profile" configured={hasClerkConfiguration()}>
      <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-800">
          Your information
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-brand-ink">
          Professional profile
        </h1>
        <p className="mt-3 max-w-2xl leading-7 text-muted">
          Manage your profile details. Information you confirm here can support
          future job-fit assessments and CV tailoring.
        </p>
        <section className="mt-8 rounded-2xl border border-slate-200 bg-surface p-5 shadow-sm sm:p-7">
          <ProfileForm />
        </section>
      </main>
    </WorkspaceShell>
  );
}
