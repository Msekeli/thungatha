"use client";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import {
  BriefcaseBusiness,
  UserRound,
  Settings,
  House,
  LogIn,
  UserRoundPlus,
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
      <nav aria-label="More navigation">
        {isGuest ? (
          <>
            <Link href="/" onClick={onClose}>
              <House size={17} />
              Discover jobs
            </Link>
            <ButtonLink
              href="/sign-in"
              variant="secondary"
              size="md"
              onClick={onClose}
            >
              <LogIn size={17} />
              Sign in
            </ButtonLink>
            <ButtonLink
              href="/sign-up"
              variant="primary"
              size="md"
              onClick={onClose}
            >
              <UserRoundPlus size={17} />
              Create account
            </ButtonLink>
          </>
        ) : (
          <>
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
                <item.icon size={17} />
                {item.label}
              </Link>
            ))}
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
