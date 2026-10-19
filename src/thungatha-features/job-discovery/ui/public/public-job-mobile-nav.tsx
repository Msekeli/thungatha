"use client";

import Link from "next/link";
import { Show, SignInButton } from "@clerk/nextjs";
import { Bookmark, BriefcaseBusiness, FileUser, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PublicJobMobileNav({ configured }: { configured: boolean }) {
  return (
    <nav className="th-mobile-bottom-nav" aria-label="Workspace navigation">
      <Link href="/" className="active">
        <Search size={18} />
        <span>Discover</span>
      </Link>
      {configured && (
        <Show when="signed-in">
          <Link href="/cv-studio">
            <FileUser size={18} />
            <span>CV Studio</span>
          </Link>
          <Link href="/applications">
            <BriefcaseBusiness size={18} />
            <span>Tracking</span>
          </Link>
          <Link href="/jobs?status=saved">
            <Bookmark size={18} />
            <span>Saved</span>
          </Link>
        </Show>
      )}
      {configured && (
        <Show when="signed-out">
          <SignInButton mode="modal" fallbackRedirectUrl="/jobs?welcome=1">
            <Button variant="ghost" aria-label="Sign in to use CV Studio">
              <FileUser size={18} />
              <span>CV Studio</span>
            </Button>
          </SignInButton>
          <SignInButton mode="modal" fallbackRedirectUrl="/jobs?welcome=1">
            <Button variant="ghost" aria-label="Sign in to track applications">
              <BriefcaseBusiness size={18} />
              <span>Tracking</span>
            </Button>
          </SignInButton>
          <SignInButton mode="modal" fallbackRedirectUrl="/jobs?welcome=1">
            <Button variant="ghost" aria-label="Sign in to view saved jobs">
              <Bookmark size={18} />
              <span>Saved</span>
            </Button>
          </SignInButton>
        </Show>
      )}
    </nav>
  );
}
