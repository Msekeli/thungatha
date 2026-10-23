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
      <main className="th-jobs-page th-jobs-page--app th-jobs-redesign box-border flex min-h-0 w-full max-w-full flex-1 flex-col gap-4 px-3 pb-4 pt-4 md:gap-5 md:px-6 md:pt-5 max-[900px]:!px-0 max-[700px]:h-[calc(100dvh-116px-env(safe-area-inset-bottom))] max-[700px]:flex-none max-[700px]:gap-0 max-[700px]:overflow-hidden max-[700px]:p-0">
        <section className="th-public-discovery-promo-heading mx-auto w-full max-w-5xl py-1 text-center max-[1199px]:hidden">
          <h1 className="text-xl font-extrabold leading-[1.1] tracking-tight md:text-[2rem]">
            Find your next{" "}
            <span className="text-[var(--th-accent)]">opportunity</span>
          </h1>
          <p className="mt-2 hidden text-sm text-fg-muted md:block md:whitespace-nowrap md:text-base">
            Explore thousands of jobs in South Africa and beyond. Create an
            account to tailor your CV, save jobs and track your applications.
          </p>
        </section>
        <div className="min-h-0 flex-1 max-[700px]:flex max-[700px]:flex-col">
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
