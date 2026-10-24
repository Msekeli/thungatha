"use client";

import { ArrowRight, FileText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ProfileEmptyState({
  onStartManualEntry,
}: {
  onStartManualEntry: () => void;
}) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 py-5 sm:gap-8 sm:py-8">
      <div>
        <span className="inline-flex items-center gap-2 rounded-full border border-line bg-panel px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-fg-muted">
          <Sparkles size={13} className="text-accent" />
          Your career profile
        </span>
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-fg sm:text-3xl">
          Your experience, all in one place.
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-fg-muted sm:text-base">
          Create a reusable professional profile for your job search. Add your
          details once, then keep them organised as you move forward.
        </p>
      </div>

      <section className="rounded-2xl border border-line bg-panel p-5 shadow-sm sm:p-7">
        <div className="flex items-start gap-4">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-panel-2 text-accent">
            <FileText size={21} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-semibold text-fg">Start from your CV</h2>
              <span className="rounded-full bg-panel-2 px-2.5 py-1 text-[10px] font-semibold text-fg-muted">
                Coming soon
              </span>
            </div>
            <p className="mt-1 text-sm leading-relaxed text-fg-muted">
              CV import is planned, but is not available yet. You can create
              your profile manually in the meantime.
            </p>
            <Button
              type="button"
              variant="secondary"
              disabled
              className="mt-4 w-full sm:w-auto"
              title="CV import is not available yet"
            >
              CV import coming soon
            </Button>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-accent/40 bg-panel p-5 sm:p-7">
        <div className="max-w-xl">
          <h2 className="text-base font-semibold text-fg">Build it yourself</h2>
          <p className="mt-1 text-sm leading-relaxed text-fg-muted">
            Add your contact details, professional summary, experience,
            education and skills. You can review everything before saving.
          </p>
          <Button
            type="button"
            variant="primary"
            onClick={onStartManualEntry}
            className="mt-5 w-full sm:w-auto"
          >
            Enter details manually
            <ArrowRight size={16} />
          </Button>
        </div>
      </section>

      <p className="text-center text-xs leading-relaxed text-fg-muted">
        Your profile stays in draft until you choose to save it.
      </p>
    </div>
  );
}
