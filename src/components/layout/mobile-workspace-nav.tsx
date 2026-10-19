"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Compass,
  Menu,
  X,
} from "lucide-react";
import Image from "next/image";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { MobileWorkspaceMenu, MobileWorkspaceBottomNav } from "@/components/layout/mobile-workspace-menu";
import "./mobile-workspace-nav.css";

type Destination = { href: string; label: string; icon: typeof Compass };

export function MobileWorkspaceNav({ configured }: { configured: boolean }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const jobStatus = searchParams.get("status");
  const [menuOpen, setMenuOpen] = useState(false);

  const isActiveHref = (hrefValue: string) => {
    const [href, query] = hrefValue.split("?");
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
          <Button
            variant="ghost"
            size="md"
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
          </Button>
        </div>
      </header>

      <MobileWorkspaceMenu open={menuOpen} configured={configured} isActive={isActiveHref} onClose={() => setMenuOpen(false)} />
      <MobileWorkspaceBottomNav isActive={isActiveHref} />
    </>
  );
}
