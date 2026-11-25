"use client";

import { Button, ButtonLink } from "@/components/ui/button";

export function CvStudioWelcomePanel({
  onAddExternalJob,
}: {
  onAddExternalJob: () => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-accent-text">
          CV Studio
        </p>
        <h2 className="mt-1 text-xl font-semibold text-fg">
          Prepare your CV for an opportunity
        </h2>
        <p className="mt-2 text-sm leading-6 text-fg-muted">
          Your master CV is ready. Provide the job details to prepare a CV for that opportunity.
        </p>
      </div>
      <div className="rounded-xl border border-line bg-panel-2 p-4">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-panel p-2 text-accent-text">
            <span aria-hidden="true">↗</span>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-fg">Applying for an external opportunity?</h3>
            <p className="mt-1 text-sm leading-6 text-fg-muted">
              Found a job on LinkedIn, a company website or elsewhere? Add its title, company and description here.
            </p>
            <Button className="mt-4 w-full sm:w-auto" onClick={onAddExternalJob}>
              Add external job
            </Button>
          </div>
        </div>
      </div>
      <div className="rounded-xl border border-line p-4">
        <h3 className="font-semibold text-fg">Found a job on Thungatha?</h3>
        <p className="mt-1 text-sm leading-6 text-fg-muted">
          Open Job Discovery, select an opportunity and choose{" "}
          <span className="font-medium text-fg">Tailor my CV</span>. The job will appear here automatically.
        </p>
        <ButtonLink className="mt-4 w-full sm:w-auto" variant="outline" href="/jobs">
          Go to Job Discovery
        </ButtonLink>
      </div>
      <p className="border-t border-line pt-4 text-xs leading-5 text-fg-muted">
        Your master CV is built from your confirmed Profile. Adding a job never changes your Profile or master CV.
      </p>
    </div>
  );
}
