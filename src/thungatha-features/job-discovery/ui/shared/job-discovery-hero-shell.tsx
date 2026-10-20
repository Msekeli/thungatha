import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

type Props = {
  title: ReactNode;
  description: ReactNode;
  children?: ReactNode;
  id?: string;
};

export function JobDiscoveryHeroShell({
  title,
  description,
  children,
  id,
}: Props) {
  return (
    <Box
      component="section"
      id={id}
      className="th-discovery-hero"
      sx={{
        px: { xs: 2, md: 4 },
        py: { xs: 1, md: 1.5 },
        borderRadius: { xs: 0, md: 3 },
        background:
          "linear-gradient(135deg, rgba(25, 118, 210, 0.07), rgba(25, 118, 210, 0.015))",
      }}
    >
      <Typography
        variant="h2"
        component="h1"
        sx={{
          fontWeight: 800,
          fontSize: { xs: "1.7rem", md: "2.6rem" },
          lineHeight: 1.1,
        }}
      >
        {title}
      </Typography>
      <Typography
        color="text.secondary"
        sx={{ mt: 0.5, mb: 1.5, maxWidth: 680 }}
      >
        {description}
      </Typography>
      {children}
    </Box>
  );
}
