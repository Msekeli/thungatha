import Link from "next/link";
import type { ReactNode } from "react";
import { BrandMark } from "@/components/brand-mark";

// Shared frame for /sign-in and /sign-up. Clerk's own card goes in `children`.
export function AuthPageShell({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen flex-1 lg:grid-cols-[5fr_6fr]">
      <aside
        aria-label="About Thungatha"
        className="th-brand-panel relative hidden flex-col justify-between overflow-hidden p-12 text-brand lg:flex"
      >
        <BrandMark />
        <div className="flex max-w-[440px] flex-col gap-7">
          <div>
            <h2 className="text-3xl font-medium leading-9">
              Know if a job is worth your time.
            </h2>
            <p className="mt-3 text-[14px] leading-[22px] text-nav-text">
              Every match shows the evidence behind it. You decide what goes on
              your CV and what happens next.
            </p>
          </div>
          <div className="rounded-panel border border-line bg-panel p-5">
            <p className="text-control font-medium">
              Evidence-led job matching
            </p>
            <p className="mt-2 text-detail leading-6 text-fg-muted">
              Review the requirements, see what your experience supports, and
              decide what to do next.
            </p>
          </div>
        </div>
      </aside>
      <main className="th-auth-glow relative flex flex-col items-center justify-center gap-5 px-6 py-16">
        <Link
          href="/"
          className="absolute left-6 top-6 inline-flex items-center gap-1.5 text-detail text-fg-muted hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-text"
        >
          <span aria-hidden="true">←</span> Back to home
        </Link>
        <div className="lg:hidden">
          <BrandMark />
        </div>
        {children}
      </main>
    </div>
  );
}
