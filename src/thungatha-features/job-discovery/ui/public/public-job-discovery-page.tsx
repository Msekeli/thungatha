import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import JobsDiscovery from "../jobs-discovery";
import { PublicDiscoveryShell } from "../shared/public-discovery-shell";
import { PublicJobDiscoveryPromoSidebar } from "./public-job-discovery-promo-sidebar";

export function PublicJobDiscoveryPage({
  configured,
}: {
  configured: boolean;
}) {
  return (
    <PublicDiscoveryShell configured={configured}>
      <Box
        component="main"
        className="th-jobs-page th-jobs-redesign"
        sx={{
          display: "flex",
          flex: "1 1 auto",
          flexDirection: "column",
          width: "100%",
          minWidth: 0,
          minHeight: 0,
          maxWidth: "100%",
          boxSizing: "border-box",
          pt: { xs: 2, md: 2.5 },
          pb: 2,
          px: { xs: 1.5, md: 2.5 },
          "@media (max-width: 760px)": {
            flex: "0 0 auto",
            minHeight: "auto",
            pb: 2,
          },
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: 980,
            mx: "auto",
            mb: { xs: 2, md: 2.5 },
            textAlign: "center",
          }}
        >
          <Typography
            component="h1"
            variant="h4"
            sx={{ fontWeight: 800, letterSpacing: "-0.035em" }}
          >
            Find your next opportunity
          </Typography>
          <Typography
            color="text.secondary"
            sx={{ mt: 0.75, maxWidth: 760, mx: "auto" }}
          >
            Explore jobs across South Africa. Search by job title, skill, or
            company and discover your next move.
          </Typography>
        </Box>
        <Box sx={{ flex: "1 1 auto", minHeight: 0 }}>
          <JobsDiscovery
            configured={configured}
            workspaceLeadingColumn={
              <PublicJobDiscoveryPromoSidebar configured={configured} />
            }
          />
        </Box>
      </Box>
    </PublicDiscoveryShell>
  );
}
