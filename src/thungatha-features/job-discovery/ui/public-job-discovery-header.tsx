"use client";

import Image from "next/image";
import Link from "next/link";
import { Show, SignInButton } from "@clerk/nextjs";
import { Menu } from "lucide-react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { HomeAuthActions } from "@/thungatha-features/authentication/ui/home-auth-actions";

type Props = {
  configured: boolean;
  onOpenFilters: () => void;
};

export function PublicJobDiscoveryHeader({ configured, onOpenFilters }: Props) {
  return (
    <header className="th-discovery-header">
      <Link href="/" className="th-discovery-brand" aria-label="Thungatha home">
        <Image
          src="/brand/thungatha-logo.svg"
          alt="THUNGATHA"
          width={180}
          height={42}
          priority
          className="th-full-logo"
        />
      </Link>
      <nav className="th-desktop-nav" aria-label="Main navigation">
        <Link className="active" href="#jobs">Find Jobs</Link>
        {configured && (
          <Show when="signed-in">
            <Link href="/cv-studio">Tailor Your CV</Link>
            <Link href="/applications">Track Applications</Link>
            <Link href="/jobs?status=saved">Saved Jobs</Link>
          </Show>
        )}
        {configured && (
          <Show when="signed-out">
            <SignInButton mode="modal" fallbackRedirectUrl="/jobs?welcome=1">
              <Button variant="ghost">Tailor Your CV</Button>
            </SignInButton>
            <SignInButton mode="modal" fallbackRedirectUrl="/jobs?welcome=1">
              <Button variant="ghost">Track Applications</Button>
            </SignInButton>
            <SignInButton mode="modal" fallbackRedirectUrl="/jobs?welcome=1">
              <Button variant="ghost">Saved Jobs</Button>
            </SignInButton>
          </Show>
        )}
      </nav>
      <div className="th-discovery-header-actions">
        <ThemeToggle />
        <HomeAuthActions configured={configured} variant="nav" />
        <Button
          variant="ghost"
          className="th-icon-button th-menu-button"
          type="button"
          aria-label="Open filters"
          onClick={onOpenFilters}
        >
          <Menu size={19} />
        </Button>
      </div>
    </header>
  );
}
