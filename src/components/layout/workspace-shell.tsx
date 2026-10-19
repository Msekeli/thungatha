"use client";

import type { ReactNode } from "react";
import "./workspace-shell.css";
import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { SignOutControl } from "@/thungatha-features/authentication/ui/sign-out-control";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { ButtonLink } from "@/components/ui/button";
import { MobileWorkspaceNav } from "@/components/layout/mobile-workspace-nav";

import { WorkspaceSidebarNav } from "@/components/layout/workspace-sidebar-nav";

export function WorkspaceShell({
  active,
  configured,
  children,
}: {
  active: string;
  configured: boolean;
  children: ReactNode;
}) {
  return (
    <div className="th-workspace-shell">
      <MobileWorkspaceNav configured={configured} />
      <aside className="th-workspace-sidebar" aria-label="Main navigation">
        <div className="th-workspace-brand">
          <BrandMark />
        </div>
        <WorkspaceSidebarNav active={active} />
        <div className="th-workspace-sidebar-footer">
          <Link href="/" className="th-workspace-home-link">
            ← Home
          </Link>
          <ThemeToggle />
          <div className="th-workspace-user-card">
            <span className="th-workspace-avatar" aria-hidden="true">
              <UserRound size={17} strokeWidth={1.7} />
            </span>
            <div className="th-workspace-user-copy">
              <span className="th-workspace-user-name">Msekeli Mkwibiso</span>
              <span className="th-workspace-user-action">
                {configured ? (
                  <SignOutControl />
                ) : (
                  <ButtonLink href="/sign-in" variant="secondary" size="md">
                    Sign in
                  </ButtonLink>
                )}
              </span>
            </div>
          </div>
        </div>
      </aside>
      <div className="th-workspace-content">{children}</div>
    </div>
  );
}
