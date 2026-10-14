import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { SignOutControl } from "@/components/auth/sign-out-control";
import { AuthConfigurationNotice } from "@/components/auth/auth-configuration-notice";
import {
  getAuthenticatedIdentity,
  hasClerkConfiguration,
} from "@/lib/auth/identity";

const navigation = [
  { href: "/dashboard", label: "Overview", available: true },
  { href: "/dashboard#profile", label: "Profile", available: true },
  { href: null, label: "Jobs", available: false },
  { href: null, label: "CV Studio", available: false },
  { href: null, label: "Applications", available: false },
  { href: null, label: "Preferences", available: false },
];

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  if (!hasClerkConfiguration()) {
    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
        <AuthConfigurationNotice />
      </main>
    );
  }

  const identity = await getAuthenticatedIdentity();
  if (!identity) redirect("/sign-in");

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)] lg:flex-row">
      <aside className="flex shrink-0 flex-col bg-brand-ink text-white lg:min-h-screen lg:w-64">
        <Link
          href="/dashboard"
          className="flex items-center px-5 py-4 lg:px-6 lg:py-7"
          aria-label="Thungatha workspace home"
        >
          <Image
            src="/brand/thungatha-logo.svg"
            alt="Thungatha"
            width={190}
            height={54}
            priority
          />
        </Link>
        <nav
          aria-label="Workspace"
          className="flex gap-2 overflow-x-auto px-4 pb-4 lg:flex-1 lg:flex-col lg:overflow-visible lg:px-3 lg:pt-5"
        >
          {navigation.map(({ href, label, available }, index) =>
            href ? (
              <Link
                key={label}
                href={href}
                aria-current={index === 0 ? "page" : undefined}
                className={`shrink-0 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${index === 0 ? "bg-white/15 text-white" : "text-slate-300 hover:bg-white/10 hover:text-white"}`}
              >
                {label}
              </Link>
            ) : (
              <span
                key={label}
                aria-disabled="true"
                title="Available in a later milestone"
                className={`shrink-0 rounded-lg px-3 py-2.5 text-sm font-medium ${available ? "text-slate-300" : "cursor-not-allowed text-slate-500"}`}
              >
                {label}
              </span>
            ),
          )}
        </nav>
        <div className="hidden border-t border-white/10 p-4 lg:block">
          <SignOutControl />
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-surface px-4 py-3 sm:px-6 lg:px-10">
          <p className="text-sm font-medium text-muted">
            Your career workspace
          </p>
          <div className="lg:hidden">
            <SignOutControl />
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
          {children}
        </main>
      </div>
    </div>
  );
}
