import { hasClerkConfiguration } from "@/thungatha-features/authentication/server/identity";
import Box from "@mui/material/Box";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import JobsDiscovery from "@/thungatha-features/job-discovery/ui/jobs-discovery";

type PageProps = { searchParams: Promise<{ welcome?: string | string[] }> };

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const welcome = Array.isArray(params.welcome)
    ? params.welcome.includes("1")
    : params.welcome === "1";
  return (
    <WorkspaceShell active="/jobs" configured={hasClerkConfiguration()}>
      <Box
        component="div"
        className="th-jobs-page th-jobs-redesign"
        sx={{
          display: "flex",
          flex: "1 1 auto",
          flexDirection: "column",
          width: "min(calc(100% - 40px), 1600px)",
          minWidth: 0,
          minHeight: 0,
          maxWidth: "100%",
          boxSizing: "border-box",
          pt: 2.25,
          pb: 2.25,
          mx: "auto",
          "@media (max-width: 760px)": {
            width: "100%",
            flex: "0 0 auto",
            minHeight: "auto",
            p: 1.5,
          },
        }}
      >
        <JobsDiscovery
          configured={hasClerkConfiguration()}
          showProfileSetupPrompt={welcome}
        />
      </Box>
    </WorkspaceShell>
  );
}
