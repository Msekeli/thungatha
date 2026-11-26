"use client";

import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { LogIn, UserRoundPlus } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { SignOutControl } from "@/thungatha-features/authentication";
import { MobileWorkspaceMenuLinks } from "./mobile-menu-links";

type Props = {
  configured: boolean;
  isGuest: boolean;
  isActive: (href: string) => boolean;
  onClose: () => void;
};

export function MobileWorkspaceMenuContent({
  configured,
  isGuest,
  isActive,
  onClose,
}: Props) {
  return (
    <div className="th-mobile-workspace-menu" id="th-mobile-workspace-menu">
      <nav
        className="th-mobile-workspace-menu-nav"
        aria-label="Mobile navigation"
      >
        <MobileWorkspaceMenuLinks
          configured={configured}
          isGuest={isGuest}
          isActive={isActive}
          onClose={onClose}
        />
        {isGuest &&
          (configured ? (
            <ConfiguredAuthActions onClose={onClose} />
          ) : (
            <UnconfiguredAuthActions onClose={onClose} />
          ))}
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

function ConfiguredAuthActions({ onClose }: { onClose: () => void }) {
  return (
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
  );
}

function UnconfiguredAuthActions({ onClose }: { onClose: () => void }) {
  return (
    <>
      <ButtonLink
        href="/sign-in"
        variant="secondary"
        size="md"
        onClick={onClose}
      >
        <LogIn size={17} />
        Sign in
      </ButtonLink>
      <ButtonLink href="/sign-up" variant="primary" size="md" onClick={onClose}>
        <UserRoundPlus size={17} />
        Create account
      </ButtonLink>
    </>
  );
}
