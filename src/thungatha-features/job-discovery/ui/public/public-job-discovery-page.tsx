import Box from "@mui/material/Box";
import JobsDiscovery from "../jobs-discovery";
import { PublicJobDiscoveryPromoSidebar } from "./public-job-discovery-promo-sidebar";
import { JobDiscoveryHeroShell } from "../shared/job-discovery-hero-shell";
import { PublicDiscoveryShell } from "../shared/public-discovery-shell";

export function PublicJobDiscoveryPage({
  configured,
}: {
  configured: boolean;
}) {
  return (
    <PublicDiscoveryShell configured={configured}>
      <JobDiscoveryHeroShell
        title={
          <>
            Find your next{" "}
            <Box component="span" sx={{ color: "primary.main" }}>
              opportunity
            </Box>
          </>
        }
        description="Explore thousands of jobs in South Africa and beyond. Create an account to tailor your CV, save jobs and track your applications."
      />
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
          pt: 1,
          pb: 2,
          px: { xs: 1.5, md: 2 },
          "@media (max-width: 760px)": {
            flex: "0 0 auto",
            minHeight: "auto",
            pb: 2,
          },
        }}
      >
        <JobsDiscovery
          configured={configured}
          workspaceLeadingColumn={
            <PublicJobDiscoveryPromoSidebar configured={configured} />
          }
        />
      </Box>
    </PublicDiscoveryShell>
  );
}
