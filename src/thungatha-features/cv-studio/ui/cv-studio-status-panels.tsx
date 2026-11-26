"use client";

import { Button, ButtonLink } from "@/components/ui/button";
import type { State } from "./cv-studio-types";

export function CvStudioStatusPanels({
  state,
  onRetry,
}: {
  state: State;
  onRetry: () => void;
}) {
  return (
    <>
      {state.status === "loading" && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6" aria-live="polite">
          Checking your Profile and CV versions…
        </section>
      )}
      {state.status === "error" && (
        <section className="rounded-2xl border border-rose-200 bg-rose-50 p-6" role="alert">
          <h2 className="font-semibold text-rose-900">CV Studio could not load</h2>
          <p className="mt-2 text-sm text-rose-800">{state.message}</p>
          <Button className="mt-4" variant="outline" onClick={onRetry}>Try again</Button>
        </section>
      )}
      {state.status === "profile_required" && (
        <section className="grid gap-6 rounded-2xl border border-amber-200 bg-amber-50 p-6 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <h2 className="text-lg font-semibold text-amber-950">
              {state.confirmed ? "Your Profile needs more information" : "Complete and confirm your Profile first"}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-amber-900">
              CV Studio uses confirmed Profile information as its only source of candidate facts.
              Complete the missing information and confirm your Profile before generating a CV.
            </p>
            {state.missing.length > 0 && (
              <ul className="mt-4 list-inside list-disc space-y-1 text-sm text-amber-950">
                {state.missing.map((item) => <li key={item}>{item}</li>)}
              </ul>
            )}
          </div>
          <ButtonLink href="/profile">Complete Profile</ButtonLink>
        </section>
      )}
    </>
  );
}
