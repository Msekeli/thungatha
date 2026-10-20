import type { ReactNode } from "react";
import Box from "@mui/material/Box";
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
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100dvh",
        minHeight: 0,
        overflow: "hidden",
        bgcolor: "background.default",
        "@media (max-width: 760px)": {
          height: "auto",
          minHeight: "calc(100dvh - 56px)",
          overflow: "visible",
          pb: 10,
        },
      }}
    >
      <Box
        component="header"
        sx={{
          display: { xs: "none", md: "flex" },
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          px: { xs: 1.5, md: 4 },
          py: 1.5,
          borderBottom: 1,
          borderColor: "divider",
          bgcolor: "background.paper",
          flex: "0 0 auto",
        }}
      >
        <BrandMark />
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <ThemeToggle />
          <HomeAuthActions configured={configured} variant="nav" />
        </Box>
      </Box>
      {children}
    </Box>
  );
}
