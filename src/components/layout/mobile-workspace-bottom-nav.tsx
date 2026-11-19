"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { Compass, PanelsTopLeft, ClipboardCheck, Bookmark } from "lucide-react";
import { PublicAuthPrompt } from "@/thungatha-features/job-discovery/ui/public/public-auth-prompt";

const items = [
  { href: "/jobs", label: "Discover", icon: Compass },
  { href: "/cv-studio", label: "CV Studio", icon: PanelsTopLeft },
  { href: "/applications", label: "Tracking", icon: ClipboardCheck },
  { href: "/jobs?status=saved", label: "Saved", icon: Bookmark },
];
type Active = (href: string) => boolean;

export function MobileWorkspaceBottomNav({
  isActive,
  publicMode = false,
  configured = true,
}: {
  isActive: Active;
  publicMode?: boolean;
  configured?: boolean;
}) {
  const { isLoaded, isSignedIn } = useAuth();
  const links = publicMode
    ? [{ ...items[0], href: "/" }, ...items.slice(1)]
    : items;
  const renderLink = (item: (typeof items)[number]) => (
    <Link
      key={item.href}
      href={item.href}
      data-active={isActive(item.href)}
      aria-current={isActive(item.href) ? "page" : undefined}
    >
      <item.icon size={19} strokeWidth={1.8} />
      <span>{item.label}</span>
    </Link>
  );
  const guest = !configured || (isLoaded && !isSignedIn);

  return (
    <nav
      className={`th-mobile-bottom-nav ${publicMode ? "th-mobile-bottom-nav--public" : "th-mobile-bottom-nav--workspace"}`}
      aria-label="Primary navigation"
    >
      {guest ? (
        <>
          {renderLink(links[0])}
          {links.slice(1).map((item) => (
            <PublicAuthPrompt
              key={item.href}
              configured={configured}
              title={`Access ${item.label}`}
              description={`Sign in or create a free account to access ${item.label.toLowerCase()} and keep your job search organised.`}
              side="top"
              align="center"
              sideOffset={10}
              triggerClassName="th-mobile-auth-trigger"
            >
              <button
                type="button"
                aria-label={`Sign in to access ${item.label}`}
              >
                <item.icon size={19} strokeWidth={1.8} />
                <span>{item.label}</span>
              </button>
            </PublicAuthPrompt>
          ))}
        </>
      ) : (
        links.map(renderLink)
      )}
    </nav>
  );
}
