import type { ReactNode } from "react";
import { BrandMark } from "@/components/brand-mark";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { HomeAuthActions } from "@/thungatha-features/authentication/ui/home-auth-actions";

export function PublicDiscoveryShell({
  configured,
  children,
}: {
  configured: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-bg text-fg md:h-dvh md:overflow-hidden">
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-line bg-panel px-4 py-3 md:px-8">
        <BrandMark />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <HomeAuthActions configured={configured} variant="nav" />
        </div>
      </header>
      {children}
    </div>
  );
}
