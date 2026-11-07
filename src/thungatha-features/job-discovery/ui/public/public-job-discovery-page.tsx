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
      <main className="flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-page-gradient pb-0 pt-0 md:gap-0">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <JobsDiscovery
            configured={configured}
            workspaceLeadingColumn={
              <PublicJobDiscoveryPromoSidebar configured={configured} />
            }
          />
        </div>
      </main>
    </PublicDiscoveryShell>
  );
}
