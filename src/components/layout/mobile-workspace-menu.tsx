"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Show, SignInButton, useAuth } from "@clerk/nextjs";
import {
  House,
  Compass,
  PanelsTopLeft,
  ClipboardCheck,
  Bookmark,
  BriefcaseBusiness,
  UserRound,
  Settings,
} from "lucide-react";
import { SignOutControl } from "@/thungatha-features/authentication/ui/sign-out-control";
import { ButtonLink } from "@/components/ui/button";

const secondary = [
  {
    href: "/jobs?status=dismissed",
    label: "Dismissed jobs",
    icon: BriefcaseBusiness,
  },
  { href: "/profile", label: "Profile", icon: UserRound },
  { href: "/account", label: "Settings", icon: Settings },
];
const primary = [
  { href: "/jobs", label: "Discover", icon: Compass },
  { href: "/cv-studio", label: "CV Studio", icon: PanelsTopLeft },
  { href: "/applications", label: "Tracking", icon: ClipboardCheck },
  { href: "/jobs?status=saved", label: "Saved", icon: Bookmark },
];

export function MobileWorkspaceMenu({
  open,
  configured,
  isActive,
  onClose,
}: {
  open: boolean;
  configured: boolean;
  isActive: (href: string) => boolean;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div className="th-mobile-workspace-menu" id="th-mobile-workspace-menu">
      <nav aria-label="More navigation">
        <Link href="/" onClick={onClose}>
          <House size={17} />
          Home
        </Link>
        {secondary.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            data-active={isActive(item.href)}
            onClick={onClose}
          >
            <item.icon size={17} aria-hidden="true" />
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="th-mobile-workspace-account">
        <span className="th-mobile-workspace-account-name">
          Msekeli Mkwibiso
        </span>
        {configured ? (
          <SignOutControl />
        ) : (
          <ButtonLink href="/sign-in" variant="secondary" size="md">
            Sign in
          </ButtonLink>
        )}
      </div>
    </div>
  );
}

export function MobileWorkspaceBottomNav({
  isActive,
  publicMode = false,
  configured = true,
}: {
  isActive: (href: string) => boolean;
  publicMode?: boolean;
  configured?: boolean;
}) {
  const { isLoaded, isSignedIn } = useAuth();
  const items = publicMode ? [{ ...primary[0], href: "/" }, ...primary.slice(1)] : primary;
  const renderLink = (item: (typeof primary)[number]) => (
    <Link
      key={item.href}
      href={item.href}
      data-active={isActive(item.href)}
      aria-current={isActive(item.href) ? "page" : undefined}
    >
      <item.icon size={19} strokeWidth={1.8} aria-hidden="true" />
      <span>{item.label}</span>
    </Link>
  );
  return (
    <nav className="th-mobile-bottom-nav" aria-label="Primary navigation">
      {publicMode && configured && isLoaded && !isSignedIn ? (
        <>
          {renderLink(items[0])}
          {items.slice(1).map((item) => (
            <SignInButton key={item.href} mode="modal" fallbackRedirectUrl="/jobs?welcome=1">
              <a href={item.href} aria-label={`Sign in to access ${item.label}`}>
                <item.icon size={19} strokeWidth={1.8} aria-hidden="true" />
                <span>{item.label}</span>
              </a>
            </SignInButton>
          ))}
        </>
      ) : publicMode && !configured ? renderLink(items[0]) : items.map(renderLink)}
    </nav>
  );
}

export function PublicMobileShellNav({ configured }: { configured: boolean }) {
  const pathname = usePathname();
  if (pathname !== "/") return null;
  return (
    <MobileWorkspaceBottomNav
      publicMode
      configured={configured}
      isActive={(href) => href === "/"}
    />
  );
}
