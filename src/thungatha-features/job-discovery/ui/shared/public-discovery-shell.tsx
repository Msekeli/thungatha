import type { ReactNode } from "react";
import { BrandMark } from "@/components/brand-mark";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { HomeAuthActions } from "@/thungatha-features/authentication/ui/home-auth-actions";
import { MobileWorkspaceNav } from "@/components/layout/mobile-workspace-nav";

export function PublicDiscoveryShell({
  configured,
  children,
}: {
  configured: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-bg text-fg md:h-dvh md:overflow-hidden max-[700px]:h-dvh max-[700px]:min-h-0 max-[700px]:overflow-hidden">
      <MobileWorkspaceNav configured={configured} publicMode />
      <header className="flex h-18 shrink-0 items-center justify-between gap-3 border-b border-public-nav-border bg-public-nav px-8 py-0 text-white max-[700px]:hidden">
        <BrandMark />
        <div className="flex items-center gap-2">
          <ThemeToggle className="h-11 w-11 !border-public-nav-border !bg-transparent !text-white hover:!bg-white/10" />
          <HomeAuthActions configured={configured} variant="nav" />
        </div>
      </header>
      {children}
    </div>
  );
}
