"use client";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProfileCvUpload } from "./profile-cv-upload";
import type { ExtractedCvFields } from "./profile-cv-extraction";
export function ProfileEmptyState({ onStartManualEntry, onExtracted }: {
  onStartManualEntry: () => void; onExtracted: (fields: ExtractedCvFields) => void;
}) {
  return <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 py-5 sm:gap-8 sm:py-8">
    <header className="space-y-3"><span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground"><Sparkles className="size-3.5" />Your career profile</span>
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">Your experience, all in one place.</h1>
      <p className="max-w-xl text-sm leading-6 text-muted-foreground">Create a reusable professional profile for your job search. Add your details once, then keep them organised as you move forward.</p>
    </header>
    <ProfileCvUpload onExtracted={onExtracted} />
    <section className="rounded-xl border border-border bg-card p-5 text-card-foreground shadow-sm sm:p-6">
      <h2 className="text-base font-semibold">Build it yourself</h2>
      <p className="mt-1 max-w-xl text-sm leading-6 text-muted-foreground">Add your contact details, professional summary, experience, education and skills. You can review everything before saving.</p>
      <Button onClick={onStartManualEntry} className="mt-5 w-full sm:w-auto">Enter details manually<ArrowRight className="size-4" /></Button>
    </section>
    <p className="text-center text-xs text-muted-foreground">Your profile stays in draft until you choose to save it.</p>
  </div>;
}
