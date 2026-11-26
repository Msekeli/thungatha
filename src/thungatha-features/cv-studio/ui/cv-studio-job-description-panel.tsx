"use client";

import { Button } from "@/components/ui/button";
import { jobDescriptionToText } from "@/thungatha-features/job-discovery/server/job-requirement-text";
import type { JobContext } from "./cv-studio-types";

export function CvStudioJobDescriptionPanel({
  jobContext, onClose,
}: {
  jobContext: JobContext;
  onClose: () => void;
}) {
  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-accent-text">
            {jobContext.source === "discovery" ? "Job from Thungatha Discovery" : "External job opportunity"}
          </p>
          <h2 className="mt-2 break-words text-xl font-semibold text-fg">{jobContext.title}</h2>
          <p className="mt-1 text-sm text-fg-muted">
            {[jobContext.company, jobContext.location].filter(Boolean).join(" · ") || "Company/location not supplied"}
          </p>
        </div>
        <Button className="w-full shrink-0 whitespace-normal sm:w-auto" variant="outline" size="sm" onClick={onClose}>
          Close job
        </Button>
      </div>
      <div className="mt-5 border-t border-line pt-4">
        <h3 className="text-sm font-semibold text-fg">Job description</h3>
        <div className="mt-2 h-[35dvh] min-h-[10rem] max-h-[22rem] overflow-y-auto overscroll-contain whitespace-pre-line rounded-lg border border-line bg-panel-2 p-4 pr-3 text-sm leading-6 text-fg-muted lg:h-[50dvh] lg:min-h-[12rem] lg:max-h-[50dvh]">
          {jobDescriptionToText(jobContext.description)}
        </div>
      </div>
    </>
  );
}
