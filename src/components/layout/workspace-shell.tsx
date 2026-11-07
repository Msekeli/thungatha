"use client";

import type { ReactNode } from "react";
import Link from "next/link";
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

const pages: Record<string, { title: string; subtitle: string }> = {
  "/jobs": {
    title: "Job Discovery",
    subtitle: "Explore real opportunities. Choose your next step.",
  },
  "/cv-studio": {
    title: "CV Studio",
    subtitle: "Build and tailor your CV with confidence.",
  },
  "/applications": {
    title: "Job Tracking",
    subtitle: "Keep your applications organised and moving forward.",
  },
  "/profile": {
    title: "Profile",
    subtitle: "Manage the professional information used across Thungatha.",
  },
  "/account": {
    title: "Account settings",
    subtitle: "Manage your preferences and account settings.",
  },
};

export function WorkspaceShell({
  active,
  configured,
  children,
}: {
  active: string;
  configured: boolean;
  children: ReactNode;
}) {
  const page = pages[active] ?? pages["/jobs"];
  return (
    <div className="th-workspace-shell">
      <MobileWorkspaceNav configured={configured} />
      <aside className="th-workspace-sidebar" aria-label="Main navigation">
        <div className="th-workspace-brand">
          <BrandMark />
        </div>
        <WorkspaceSidebarNav active={active} />
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
      <div className="th-workspace-content">
        <header
          className={`th-workspace-header ${active === "/jobs" ? "th-workspace-header--jobs" : ""}`}
        >
          <div className="th-workspace-heading">
            <h1>{page.title}</h1>
            <p>{page.subtitle}</p>
          </div>
          <ThemeToggle className="th-workspace-theme-toggle" />
        </header>
        <main className="th-workspace-page-content">{children}</main>
      </div>
    </div>
  );
}
