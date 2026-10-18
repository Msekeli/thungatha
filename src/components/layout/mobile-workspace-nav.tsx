"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Compass,
  PanelsTopLeft,
  ClipboardCheck,
  Bookmark,
  BriefcaseBusiness,
  UserRound,
  Settings,
  Menu,
  X,
  House,
} from "lucide-react";
import Image from "next/image";
import { SignOutControl } from "@/thungatha-features/authentication/ui/sign-out-control";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { ButtonLink } from "@/components/ui/button";
import "./mobile-workspace-nav.css";

type Destination = { href: string; label: string; icon: typeof Compass };

const primary: Destination[] = [
  { href: "/jobs", label: "Discover", icon: Compass },
  { href: "/cv-studio", label: "CV Studio", icon: PanelsTopLeft },
  { href: "/applications", label: "Tracking", icon: ClipboardCheck },
  { href: "/jobs?status=saved", label: "Saved", icon: Bookmark },
];

const secondary: Destination[] = [
  {
    href: "/jobs?status=dismissed",
    label: "Dismissed jobs",
    icon: BriefcaseBusiness,
  },
  { href: "/profile", label: "Profile", icon: UserRound },
  { href: "/account", label: "Settings", icon: Settings },
];

export function MobileWorkspaceNav({ configured }: { configured: boolean }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const jobStatus = searchParams.get("status");
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (item: Destination) => {
    const [href, query] = item.href.split("?");
    if (pathname !== href) return false;
    if (!query) return pathname !== "/jobs" || !jobStatus;
    const status = new URLSearchParams(query).get("status");
    return status !== null && jobStatus === status;
  };

  return (
    <>
      <header className="th-mobile-workspace-header">
        <Link
          href="/"
          className="th-mobile-workspace-brand"
          aria-label="Thungatha home"
        >
          <Image
            src="/brand/thungatha-logo.svg"
            alt="Thungatha"
            width={150}
            height={42}
            priority
          />
        </Link>
        <div className="th-mobile-workspace-header-actions">
          <ThemeToggle />
          <button
            type="button"
            className="th-mobile-menu-trigger"
            aria-label={
              menuOpen ? "Close navigation menu" : "Open navigation menu"
            }
            aria-expanded={menuOpen}
            aria-controls="th-mobile-workspace-menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {menuOpen && (
        <div className="th-mobile-workspace-menu" id="th-mobile-workspace-menu">
          <nav aria-label="More navigation">
            <Link href="/" onClick={() => setMenuOpen(false)}>
              <House size={17} />
              Home
            </Link>
            {secondary.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                data-active={isActive(item)}
                onClick={() => setMenuOpen(false)}
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
      )}

      <nav className="th-mobile-bottom-nav" aria-label="Primary navigation">
        {primary.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            data-active={isActive(item)}
            aria-current={isActive(item) ? "page" : undefined}
          >
            <item.icon size={19} strokeWidth={1.8} aria-hidden="true" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
