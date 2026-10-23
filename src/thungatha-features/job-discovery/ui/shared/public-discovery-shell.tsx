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
        minHeight: "100dvh",
        bgcolor: "background.default",
        "@media (min-width: 761px)": {
          height: "100dvh",
          overflow: "hidden",
        },
        "@media (max-width: 760px)": {
          height: "auto",
          overflow: "visible",
          pb: 10,
        },
      }}
    >
      <Box
        component="header"
        sx={{
          display: "flex",
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
