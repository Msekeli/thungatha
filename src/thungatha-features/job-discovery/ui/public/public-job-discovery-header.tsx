"use client";

import Image from "next/image";
import Link from "next/link";
import { Box, Button, Stack } from "@mui/material";
import { Show, SignInButton } from "@clerk/nextjs";
import { Menu } from "lucide-react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { HomeAuthActions } from "@/thungatha-features/authentication/ui/home-auth-actions";

type Props = { configured: boolean; onOpenFilters: () => void };

const navSx = {
  color: "text.secondary",
  textDecoration: "none",
  fontSize: "0.9rem",
  fontWeight: 600,
  "&:hover": { color: "primary.main" },
};

export function PublicJobDiscoveryHeader({ configured, onOpenFilters }: Props) {
  return (
    <Box component="header" sx={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      gap: 2, px: { xs: 2, md: 4 }, py: 1.5, borderBottom: 1,
      borderColor: "divider", bgcolor: "background.paper",
    }}>
      <Link href="/" aria-label="Thungatha home" style={{ display: "flex", flexShrink: 0 }}>
        <Image src="/brand/thungatha-logo.svg" alt="THUNGATHA" width={180} height={42} priority />
      </Link>
      <Stack component="nav" direction="row" spacing={2.5} alignItems="center"
        aria-label="Main navigation" sx={{ display: { xs: "none", md: "flex" } }}>
        <Link href="#jobs" style={{ ...navSx, color: "var(--mui-palette-primary-main)" }}>Find Jobs</Link>
        {configured && <Show when="signed-in">
          <Link href="/cv-studio" style={navSx}>Tailor Your CV</Link>
          <Link href="/applications" style={navSx}>Track Applications</Link>
          <Link href="/jobs?status=saved" style={navSx}>Saved Jobs</Link>
        </Show>}
        {configured && <Show when="signed-out">
          {["Tailor Your CV", "Track Applications", "Saved Jobs"].map((label) => (
            <SignInButton key={label} mode="modal" fallbackRedirectUrl="/jobs?welcome=1">
              <Button variant="text" size="small">{label}</Button>
            </SignInButton>
          ))}
        </Show>}
      </Stack>
      <Stack direction="row" spacing={1} alignItems="center">
        <ThemeToggle />
        <HomeAuthActions configured={configured} variant="nav" />
        <Button variant="outlined" size="small" aria-label="Open filters" onClick={onOpenFilters}
          sx={{ minWidth: 40, px: 1, display: { xs: "inline-flex", md: "none" } }}>
          <Menu size={19} />
        </Button>
      </Stack>
    </Box>
  );
}
