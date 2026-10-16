import Link from "next/link";

export default function Page() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-800">
        Thungatha to be replaced during the next milestone with a more
        descriptive tagline which is C07
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-brand-ink">
        Job Discovery
      </h1>
      <p className="mt-3 max-w-2xl leading-7 text-muted">
        Discover and filter job opportunities from approved sources.
      </p>
      <p className="mt-5 text-sm leading-6 text-muted">
        This feature is not available yet. Its functionality will be introduced
        in a later milestone.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-brand-ink transition-colors hover:bg-slate-50"
      >
        Back to home
      </Link>
    </main>
  );
}
