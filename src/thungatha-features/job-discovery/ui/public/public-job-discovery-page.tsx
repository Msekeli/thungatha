import JobsDiscovery from "../jobs-discovery";
import { PublicDiscoveryShell } from "../shared/public-discovery-shell";
import { PublicJobDiscoveryPromoSidebar } from "./public-job-discovery-promo-sidebar";

export function PublicJobDiscoveryPage({ configured }: { configured: boolean }) {
  return (
    <PublicDiscoveryShell configured={configured}>
      <main className="flex min-h-0 w-full flex-1 flex-col overflow-y-auto overscroll-y-contain bg-page px-3 pb-24 pt-4 md:gap-5 md:px-6 md:pb-6 md:pt-5">
        <div className="min-h-0 flex-1">
          <JobsDiscovery
            configured={configured}
            workspaceLeadingColumn={<PublicJobDiscoveryPromoSidebar configured={configured} />}
          />
        </div>
      </main>
    </PublicDiscoveryShell>
  );
}
