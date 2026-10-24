"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProfileCvUpload } from "./profile-cv-upload";
import type { ExtractedCvFields } from "./profile-cv-extraction";

export function ProfileEmptyState({
  onStartManualEntry,
  onExtracted,
}: {
  onStartManualEntry: () => void;
  onExtracted: (fields: ExtractedCvFields) => void;
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

      <ProfileCvUpload onExtracted={onExtracted} />

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
