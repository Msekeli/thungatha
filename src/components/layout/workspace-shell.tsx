"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import "./workspace-shell.css";
import "./workspace-sidebar-nav.css";
import "./workspace-content.css";
import "./workspace-responsive.css";
import "./workspace-mobile-shell.css";
import { BrandMark } from "@/components/brand-mark";
import { SignOutControl } from "@/thungatha-features/authentication/ui/sign-out-control";
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
        <main className="th-workspace-page-content">{children}</main>
      </div>
    </div>
  );
}
