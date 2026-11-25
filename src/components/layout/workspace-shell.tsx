"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import "./workspace-shell.css";
import "./workspace-sidebar-nav.css";
import "./workspace-content.css";
import "./workspace-responsive.css";
import "./workspace-mobile-shell.css";
import "./profile-editor.css";
import { BrandMark } from "@/components/brand-mark";
import { SignOutControl } from "@/thungatha-features/authentication/ui/sign-out-control";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { MobileWorkspaceNav } from "@/components/layout/mobile-workspace-nav";
import { WorkspaceSidebarNav } from "@/components/layout/workspace-sidebar-nav";
import { workspacePages } from "./workspace-page-config";

export function WorkspaceShell({
  active,
  configured,
  children,
}: {
  active: string;
  configured: boolean;
  children: ReactNode;
}) {
  const searchParams = useSearchParams();
  const status = searchParams.get("status");
  const jobsStatus =
    active === "/jobs" && (status === "saved" || status === "dismissed")
      ? status
      : null;
  const page =
    jobsStatus === "saved"
      ? {
          title: "Saved Jobs",
          subtitle: "Opportunities you have saved for later.",
        }
      : jobsStatus === "dismissed"
        ? {
            title: "Dismissed Jobs",
            subtitle: "Opportunities you have chosen to hide.",
          }
        : (workspacePages[active] ?? workspacePages["/jobs"]);
  const activeDestination = jobsStatus
    ? `/jobs?status=${jobsStatus}`
    : active;

  return (
    <div className="th-workspace-shell">
      <MobileWorkspaceNav configured={configured} />
      <aside className="th-workspace-sidebar" aria-label="Main navigation">
        <div className="th-workspace-brand">
          <BrandMark />
        </div>
        <WorkspaceSidebarNav active={activeDestination} />
        <div className="th-workspace-sidebar-footer">
          {configured ? (
            <SignOutControl />
          ) : (
            <Link className="th-workspace-sign-in" href="/sign-in">
              Sign in
            </Link>
          )}
        </div>
      </aside>
      <div className="th-workspace-content flex h-dvh min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <header
          className={`th-workspace-header flex min-h-[92px] items-center justify-between gap-5 border-b border-[var(--th-workspace-header-border)] bg-[var(--th-workspace-header)] px-6 py-3.5 ${active === "/jobs" ? "th-workspace-header--jobs" : ""}`}
        >
          <div className="th-workspace-heading min-w-0">
            <h1 className="m-0 text-[22px] font-semibold leading-[1.3] text-[var(--th-workspace-header-text)]">
              {page.title}
            </h1>
            <p className="mb-0 mt-[3px] text-[13px] leading-[1.5] text-[var(--th-workspace-header-muted)]">
              {page.subtitle}
            </p>
          </div>
          <ThemeToggle className="th-workspace-theme-toggle shrink-0" />
        </header>
        <main className="th-workspace-page-content min-h-0 min-w-0 flex-1 overflow-hidden px-6 py-5 has-[.th-profile-page]:flex has-[.th-profile-page]:flex-col has-[.th-profile-page]:p-0 has-[.th-jobs-page]:flex has-[.th-jobs-page]:flex-col has-[.th-jobs-page]:p-0 has-[.th-cv-studio-page]:flex has-[.th-cv-studio-page]:flex-col has-[.th-cv-studio-page]:p-0">
          {children}
        </main>
      </div>
    </div>
  );
}
