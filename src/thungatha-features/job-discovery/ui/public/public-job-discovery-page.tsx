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
      <main className="th-jobs-page th-jobs-redesign box-border flex min-h-0 w-full max-w-full flex-1 flex-col gap-4 px-3 pb-4 pt-4 md:gap-5 md:px-6 md:pt-5">
        <section className="th-discovery-hero w-full rounded-none px-0 py-2 md:rounded-2xl md:px-4 md:py-5">
          <h1 className="text-[1.7rem] font-extrabold leading-[1.1] tracking-tight md:text-[2.6rem]">
            Find your next{" "}
            <span className="text-accent">opportunity</span>
          </h1>
          <p className="mt-2 max-w-[680px] text-sm text-muted md:text-base">
            Explore thousands of jobs in South Africa and beyond. Create an
            account to tailor your CV, save jobs and track your applications.
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
