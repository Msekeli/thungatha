"use client";

import { useAuth } from "@clerk/nextjs";
import { MobileWorkspaceMenuContent } from "./mobile-menu-content";

type Props = {
  open: boolean;
  configured: boolean;
  isActive: (href: string) => boolean;
  onClose: () => void;
};

export function MobileWorkspaceMenu(props: Props) {
  if (!props.open) return null;

  if (!props.configured)
    return <MobileWorkspaceMenuContent {...props} isGuest />;

  return <ConfiguredMobileWorkspaceMenu {...props} />;
}

function ConfiguredMobileWorkspaceMenu(props: Props) {
  const { isLoaded, isSignedIn } = useAuth();

  return (
    <MobileWorkspaceMenuContent {...props} isGuest={isLoaded && !isSignedIn} />
  );
}
