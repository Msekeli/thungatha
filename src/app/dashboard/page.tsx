import { ProfileForm } from "@/components/profile/profile-form";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-800">
          Workspace overview
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-brand-ink sm:text-4xl">
          Your next opportunity starts here.
        </h1>
        <p className="mt-3 max-w-2xl leading-7 text-muted">
          Your workspace is ready. Add your name to create your private profile;
          jobs, CVs, and applications will arrive in later milestones.
        </p>
      </section>
      <section
        id="profile"
        className="max-w-2xl rounded-2xl border border-slate-200 bg-surface p-5 shadow-sm sm:p-7"
      >
        <h2 className="text-xl font-semibold text-brand-ink">Your profile</h2>
        <p className="mt-1 text-sm leading-6 text-muted">
          This foundation profile is private to your signed-in account.
        </p>
        <ProfileForm />
      </section>
    </div>
  );
}
