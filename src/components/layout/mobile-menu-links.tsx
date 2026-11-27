"use client";

import Link from "next/link";
import {
  Bookmark,
  BriefcaseBusiness,
  ClipboardCheck,
  House,
  PanelsTopLeft,
  Settings,
  UserRound,
} from "lucide-react";
import { PublicAuthPrompt } from "@/thungatha-features/job-discovery";

const workspaceLinks = [
  { href: "/cv-studio", label: "CV Studio", icon: PanelsTopLeft },
  { href: "/applications", label: "Job Tracking", icon: ClipboardCheck },
  { href: "/jobs?status=saved", label: "Saved Jobs", icon: Bookmark },
  {
    href: "/jobs?status=dismissed",
    label: "Dismissed",
    icon: BriefcaseBusiness,
  },
  { href: "/profile", label: "Profile", icon: UserRound },
  { href: "/account", label: "Settings", icon: Settings },
];

export function MobileWorkspaceMenuLinks({
  configured,
  isGuest,
  isActive,
  onClose,
}: {
  configured: boolean;
  isGuest: boolean;
  isActive: (href: string) => boolean;
  onClose: () => void;
}) {
  return (
    <>
      <Link
        href="/jobs"
        className="th-mobile-workspace-menu-link"
        onClick={onClose}
        data-active={isActive("/jobs")}
        aria-current={isActive("/jobs") ? "page" : undefined}
      >
        <House size={17} />
        Job Discovery
      </Link>
      {workspaceLinks.map((item) =>
        isGuest ? (
          <PublicAuthPrompt
            key={item.href}
            configured={configured}
            title={`Access ${item.label}`}
            description={`Sign in or create a free account to access ${item.label.toLowerCase()} and manage your job search.`}
            side="left"
            align="center"
            sideOffset={10}
            triggerClassName="th-mobile-menu-auth-trigger"
            onPromptAction={onClose}
          >
            <button type="button">
              <item.icon size={17} />
              {item.label}
            </button>
          </PublicAuthPrompt>
        ) : (
          <Link
            key={item.href}
            href={item.href}
            className="th-mobile-workspace-menu-link"
            data-active={isActive(item.href)}
            aria-current={isActive(item.href) ? "page" : undefined}
            onClick={onClose}
          >
            <item.icon size={17} />
            {item.label}
          </Link>
        ),
      )}
    </>
  );
}
