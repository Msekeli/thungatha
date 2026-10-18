"use client";

import type { ReactNode } from "react";
import "./workspace-shell.css";
import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { SignOutControl } from "@/components/auth/sign-out-control";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { ButtonLink } from "@/components/ui/button";
import { Search, PanelsTopLeft, ClipboardCheck, Bookmark, BriefcaseBusiness, UserRound, Settings } from "lucide-react";

type Destination = { href: string; label: string; icon: typeof Search };
const workspace: Destination[] = [
  { href: "/jobs", label: "Job Discovery", icon: Search },
  { href: "/cv-studio", label: "CV Studio", icon: PanelsTopLeft },
  { href: "/applications", label: "Job Tracking", icon: ClipboardCheck },
  { href: "/jobs?status=saved", label: "Saved Jobs", icon: Bookmark },
  { href: "/jobs?status=dismissed", label: "Dismissed", icon: BriefcaseBusiness },
];
const personal: Destination[] = [
  { href: "/profile", label: "Profile", icon: UserRound },
  { href: "/account", label: "Settings", icon: Settings },
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
            <Link key={item.href} href={item.href} className="th-workspace-nav-link" data-active={active === item.href} aria-current={active === item.href ? "page" : undefined}>
              <item.icon className="th-workspace-nav-icon" aria-hidden="true" size={17} strokeWidth={1.7} />{item.label}
            </Link>
          ))}
          <p className="th-workspace-nav-label th-workspace-you-label">You</p>
          {personal.map((item) => (
            <Link key={item.href} href={item.href} className="th-workspace-nav-link" data-active={active === item.href}>
              <item.icon className="th-workspace-nav-icon" aria-hidden="true" size={17} strokeWidth={1.7} />{item.label}
            </Link>
          ))}
        </nav>
        <div className="th-workspace-sidebar-footer">
          <Link href="/" className="th-workspace-home-link">← Home</Link>
          <ThemeToggle />
          <div className="th-workspace-user-card">
            <span className="th-workspace-avatar" aria-hidden="true"><UserRound size={17} strokeWidth={1.7} /></span>
            <div className="th-workspace-user-copy"><span className="th-workspace-user-name">Msekeli Mkwibiso</span><span className="th-workspace-user-action">{configured ? <SignOutControl /> : <ButtonLink href="/sign-in" variant="secondary" size="md">Sign in</ButtonLink>}</span></div>
          </div>
        </div>
      </aside>
      <div className="th-workspace-content">{children}</div>
    </div>
  );
}
