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
      <main className="th-jobs-page th-jobs-redesign flex min-h-0 w-full max-w-full flex-1 flex-col box-border px-3 pb-4 pt-4 md:px-6 md:pt-5">
        <section className="mx-auto mb-5 w-full max-w-5xl text-center">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Find your next opportunity
          </h1>
          <p className="mx-auto mt-2 max-w-3xl text-sm text-muted sm:text-base">
            Explore jobs across South Africa. Search by job title, skill, or
            company and discover your next move.
          </p>
        </section>
        <div className="min-h-0 flex-1">
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
