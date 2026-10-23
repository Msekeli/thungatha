"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import styles from "./mobile-app-shell.module.css";
import { HomeAuthActions } from "@/thungatha-features/authentication/ui/home-auth-actions";
import {
  MobileWorkspaceMenu,
} from "@/components/layout/mobile-workspace-menu";
import { MobileWorkspaceBottomNav } from "@/components/layout/mobile-workspace-bottom-nav";

const workspaceRoutes = [
  "/jobs",
  "/cv-studio",
  "/applications",
  "/profile",
  "/account",
];

export function MobileAppShell({ configured }: { configured: boolean }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isPublicDiscovery = pathname === "/";
  const isAuthenticationRoute = ["/sign-in", "/sign-up"].some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
  const isWorkspaceRoute = workspaceRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  const active = (href: string) =>
    pathname === href;

  // WorkspaceShell owns navigation for authenticated workspace routes.
  // Rendering the global app shell here duplicates its header and mobile nav.
  if (isPublicDiscovery || isWorkspaceRoute || isAuthenticationRoute) return null;

  return (
    <>
      {!isPublicDiscovery && (
        <header className={styles.header}>
          <Link href="/" aria-label="Thungatha home">
            <Image
              src="/brand/thungatha-logo.svg"
              alt="THUNGATHA"
              width={142}
              height={34}
              priority
            />
          </Link>
          <div className={styles.actions}>
            <ThemeToggle />
            <HomeAuthActions configured={configured} variant="nav" />
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 border border-line text-fg"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="th-mobile-workspace-menu"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>
        </header>
      )}
      {open && !isPublicDiscovery && (
        <MobileWorkspaceMenu
          open={open}
          configured={configured}
          isActive={active}
          onClose={() => setOpen(false)}
        />
      )}
      <MobileWorkspaceBottomNav
        configured={configured}
        publicMode
        isActive={active}
      />
    </>
  );
}
