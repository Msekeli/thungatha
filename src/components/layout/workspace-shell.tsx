"use client";

import type { ReactNode } from "react";
import "./workspace-shell.css";
import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { SignOutControl } from "@/components/auth/sign-out-control";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { ButtonLink } from "@/components/ui/button";

type Destination = { href: string; label: string; icon: string };
const workspace: Destination[] = [
  { href: "/jobs", label: "Job Discovery", icon: "⌕" },
  { href: "/cv-studio", label: "CV Studio", icon: "▤" },
  { href: "/applications", label: "Job Tracking", icon: "☑" },
];
const personal: Destination[] = [
  { href: "/profile", label: "Profile", icon: "♙" },
  { href: "/account", label: "Account", icon: "⚙" },
];

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
      <aside className="th-workspace-sidebar" aria-label="Main navigation">
        <div className="th-workspace-brand"><BrandMark /></div>
        <nav className="th-workspace-nav" aria-label="Workspace">
          <p className="th-workspace-nav-label">Workspace</p>
          {workspace.map((item) => (
            <Link key={item.href} href={item.href} className="th-workspace-nav-link" data-active={active === item.href}>
              <span className="th-workspace-nav-icon" aria-hidden="true">{item.icon}</span>{item.label}
            </Link>
          ))}
          <p className="th-workspace-nav-label th-workspace-you-label">You</p>
          {personal.map((item) => (
            <Link key={item.href} href={item.href} className="th-workspace-nav-link" data-active={active === item.href}>
              <span className="th-workspace-nav-icon" aria-hidden="true">{item.icon}</span>{item.label}
            </Link>
          ))}
        </nav>
        <div className="th-workspace-sidebar-footer">
          <Link href="/" className="th-workspace-home-link">← Home</Link>
          <ThemeToggle />
          {configured ? <SignOutControl /> : <ButtonLink href="/sign-in" variant="secondary" size="md">Sign in</ButtonLink>}
        </div>
      </aside>
      <div className="th-workspace-content">{children}</div>
    </div>
  );
}
