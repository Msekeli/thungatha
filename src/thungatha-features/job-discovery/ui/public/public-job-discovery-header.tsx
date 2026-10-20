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
    <Box
      component="header"
      sx={{
        display: { xs: "none", md: "flex" },
        alignItems: "center",
        justifyContent: "space-between",
        gap: { xs: 0.75, md: 2 },
        px: { xs: 1.5, md: 4 },
        py: { xs: 1, md: 1.5 },
        borderBottom: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Link
        href="/"
        aria-label="Thungatha home"
        style={{ display: "flex", flexShrink: 0 }}
      >
        <Image
          src="/brand/thungatha-logo.svg"
          alt="THUNGATHA"
          width={180}
          height={42}
          style={{ width: "clamp(112px, 34vw, 180px)", height: "auto" }}
          priority
        />
      </Link>
      <Stack
        component="nav"
        direction="row"
        spacing={2.5}
        aria-label="Main navigation"
        sx={{ display: { xs: "none", md: "flex" }, alignItems: "center" }}
      >
        <Box
          component={Link}
          href="#jobs"
          sx={{ ...navSx, color: "primary.main" }}
        >
          Find Jobs
        </Box>
        {configured && (
          <Show when="signed-in">
            <Box component={Link} href="/cv-studio" sx={navSx}>
              Tailor Your CV
            </Box>
            <Box component={Link} href="/applications" sx={navSx}>
              Track Applications
            </Box>
            <Box component={Link} href="/jobs?status=saved" sx={navSx}>
              Saved Jobs
            </Box>
          </Show>
        )}
        {configured && (
          <Show when="signed-out">
            {["Tailor Your CV", "Track Applications", "Saved Jobs"].map(
              (label) => (
                <SignInButton
                  key={label}
                  mode="modal"
                  fallbackRedirectUrl="/jobs?welcome=1"
                >
                  <Button variant="text" size="small">
                    {label}
                  </Button>
                </SignInButton>
              ),
            )}
          </Show>
        )}
      </Stack>
      <Stack
        direction="row"
        spacing={{ xs: 0.5, md: 1 }}
        sx={{
          alignItems: "center",
          flexShrink: 0,
          minWidth: 0,
          "& > *": { flexShrink: 0 },
        }}
      >
        <ThemeToggle />
        <HomeAuthActions configured={configured} variant="nav" />
        <Button
          variant="outlined"
          size="small"
          aria-label="Open filters"
          onClick={onOpenFilters}
          sx={{
            minWidth: { xs: 34, md: 40 },
            width: { xs: 34, md: "auto" },
            px: { xs: 0.5, md: 1 },
            display: { xs: "inline-flex", md: "none" },
          }}
        >
          <Menu size={19} />
        </Button>
      </Stack>
    </Box>
  );
}
