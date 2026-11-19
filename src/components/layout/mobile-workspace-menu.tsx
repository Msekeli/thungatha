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
  Compass,
} from "lucide-react";
import { SignOutControl } from "@/thungatha-features/authentication/ui/sign-out-control";
import { Button } from "@/components/ui/button";

const workspaceLinks = [
  { href: "/jobs", label: "Discover jobs", icon: Compass },
  { href: "/cv-studio", label: "CV Studio", icon: PanelsTopLeft },
  { href: "/applications", label: "Application tracking", icon: ClipboardCheck },
  { href: "/jobs?status=saved", label: "Saved jobs", icon: Bookmark },
  { href: "/jobs?status=dismissed", label: "Dismissed jobs", icon: BriefcaseBusiness },
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
      <nav aria-label="Mobile navigation">
        {isGuest ? (
          <>
            <Link href="/" onClick={onClose}>
              <House size={17} />
              Discover jobs
            </Link>
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
        ) : (
          workspaceLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              data-active={isActive(item.href)}
              onClick={onClose}
            >
              <item.icon size={17} />
              {item.label}
            </Link>
          ))
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
