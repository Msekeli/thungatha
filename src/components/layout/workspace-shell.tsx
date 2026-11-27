"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import "./workspace-shell.css";
import "./workspace-sidebar-nav.css";
import "./workspace-content.css";
import "./workspace-responsive.css";
import "./workspace-mobile-shell.css";
import { BrandMark } from "@/components/brand-mark";
import { SignOutControl } from "@/thungatha-features/authentication";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { MobileWorkspaceNav } from "@/components/layout/mobile-workspace-nav";
import { WorkspaceSidebarNav } from "@/components/layout/workspace-sidebar-nav";
import { resolveWorkspacePage } from "./workspace-page-config";

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
  const { page, activeDestination } = resolveWorkspacePage(
    active,
    searchParams.get("status"),
  );
  const contentClassName = [
    "th-workspace-content",
    "flex h-dvh min-h-0 min-w-0 flex-1 flex-col overflow-hidden",
  ].join(" ");
  const headerClassName = [
    "th-workspace-header",
    "flex min-h-[92px] shrink-0 items-center justify-between gap-5",
    "border-b border-[var(--th-workspace-header-border)]",
    "bg-[var(--th-workspace-nav)] px-6 py-3.5",
    active === "/jobs" && "th-workspace-header--jobs",
  ]
    .filter(Boolean)
    .join(" ");
  const pageContentClassName = [
    "th-workspace-page-content",
    "min-h-0 min-w-0 flex-1 overflow-hidden px-6 py-5",
    "has-[.th-profile-page]:flex has-[.th-profile-page]:flex-col",
    "has-[.th-profile-page]:p-0",
    "has-[.th-jobs-page]:flex has-[.th-jobs-page]:flex-col",
    "has-[.th-jobs-page]:p-0",
    "has-[.th-cv-studio-page]:flex has-[.th-cv-studio-page]:flex-col",
    "has-[.th-cv-studio-page]:p-0",
  ].join(" ");

  return (
    <div className="th-workspace-shell flex h-dvh min-h-0 w-full overflow-hidden">
      <MobileWorkspaceNav configured={configured} />
      <aside
        className="th-workspace-sidebar flex h-dvh min-h-0 shrink-0 flex-col"
        aria-label="Main navigation"
      >
        <div className="th-workspace-brand shrink-0">
          <BrandMark />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <WorkspaceSidebarNav active={activeDestination} />
        </div>
        <div className="th-workspace-sidebar-footer shrink-0">
          {configured ? (
            <SignOutControl />
          ) : (
            <Link className="th-workspace-sign-in" href="/sign-in">
              Sign in
            </Link>
          )}
        </div>
      </aside>
      <div className={contentClassName}>
        <header className={headerClassName}>
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
        <main className={pageContentClassName}>{children}</main>
      </div>
    </div>
  );
}
