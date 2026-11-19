"use client";

import Link from "next/link";
import { SignInButton, SignUpButton, useAuth } from "@clerk/nextjs";
import {
  BriefcaseBusiness,
  UserRound,
  Settings,
  House,
  LogIn,
  UserRoundPlus,
  PanelsTopLeft,
  ClipboardCheck,
  Bookmark,
} from "lucide-react";
import { SignOutControl } from "@/thungatha-features/authentication/ui/sign-out-control";
import { PublicAuthPrompt } from "@/thungatha-features/job-discovery/ui/public/public-auth-prompt";
import { Button } from "@/components/ui/button";

const workspaceLinks = [
  { href: "/cv-studio", label: "CV Studio", icon: PanelsTopLeft },
  { href: "/applications", label: "Job Tracking", icon: ClipboardCheck },
  { href: "/jobs?status=saved", label: "Saved Jobs", icon: Bookmark },
  { href: "/jobs?status=dismissed", label: "Dismissed", icon: BriefcaseBusiness },
  { href: "/profile", label: "Profile", icon: UserRound },
  { href: "/account", label: "Settings", icon: Settings },
];

type Active = (href: string) => boolean;

export function MobileWorkspaceMenu({
  open,
  configured,
  isActive,
  onClose,
}: {
  open: boolean;
  configured: boolean;
  isActive: Active;
  onClose: () => void;
}) {
  const { isLoaded, isSignedIn } = useAuth();
  if (!open) return null;

  const isGuest = !configured || (isLoaded && !isSignedIn);

  return (
    <div className="th-mobile-workspace-menu" id="th-mobile-workspace-menu">
      <nav className="th-mobile-workspace-menu-nav" aria-label="Mobile navigation">
        <Link href="/jobs" onClick={onClose} data-active={isActive("/jobs")}>
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
              className="th-workspace-nav-link"
              data-active={isActive(item.href)}
              aria-current={isActive(item.href) ? "page" : undefined}
              onClick={onClose}
            >
              <item.icon size={17} />
              {item.label}
            </Link>
          ),
        )}
        {isGuest && (
          <>
            <SignInButton mode="modal" fallbackRedirectUrl="/jobs">
              <Button variant="secondary" size="md" onClick={onClose}>
                <LogIn size={17} />
                Sign in
              </Button>
            </SignInButton>
            <SignUpButton mode="modal" fallbackRedirectUrl="/jobs">
              <Button variant="primary" size="md" onClick={onClose}>
                <UserRoundPlus size={17} />
                Create account
              </Button>
            </SignUpButton>
          </>
        )}
      </nav>
      {!isGuest && (
        <div className="th-mobile-workspace-account">
          <span className="th-mobile-workspace-account-name">Account</span>
          <SignOutControl />
        </div>
      )}
    </div>
  );
}
