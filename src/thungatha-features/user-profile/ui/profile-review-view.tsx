"use client";

import { Button } from "@/components/ui/button";
import { ChevronDown, PencilLine } from "lucide-react";
import { profileCompletionSchema, type UserProfileDto } from "../server/user-profile-schema";
import type { ReactNode } from "react";

function ReviewSection({ title, children, onEdit }: {
  title: string; children: ReactNode; onEdit: () => void;
}) {
  return (
    <details className="group rounded-xl border border-border bg-card text-card-foreground open:shadow-sm">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4 [&::-webkit-details-marker]:hidden">
        <span className="text-sm font-semibold">{title}</span>
        <span className="flex items-center gap-3 text-muted-foreground">
          <Button type="button" size="sm" variant="ghost" onClick={(event) => {
            event.preventDefault();
            onEdit();
          }}>
            <PencilLine /> Edit
          </Button>
          <ChevronDown className="size-4 transition-transform group-open:rotate-180" />
        </span>
      </summary>
      <div className="border-t border-border px-4 py-4 text-sm">{children}</div>
    </details>
  );
}

export function ProfileReviewView({ profile, onEdit, onSave, saving }: {
  profile: UserProfileDto; onEdit: () => void; onSave: () => void; saving: boolean;
}) {
  const details = profile.personalDetails;
  const contact = [details.email, details.phone, details.location].filter(Boolean).join(" · ");
  const complete = profileCompletionSchema.safeParse(profile).success;
  return (
    <main className="mx-auto w-full max-w-4xl space-y-6 pb-10">
      <header className="space-y-2 border-b border-border pb-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Profile review</p>
        <h1 className="text-3xl font-semibold tracking-tight">{details.fullName || profile.displayName || "Your professional profile"}</h1>
        <p className="text-sm text-muted-foreground">Review your information before saving it as your Thungatha profile.</p>
        {contact && <p className="text-sm text-muted-foreground">{contact}</p>}
      </header>
      <section className="rounded-xl border border-border bg-card p-5 text-card-foreground">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Professional summary</p>
        <p className="mt-3 whitespace-pre-wrap leading-7">{profile.summary || "No professional summary added yet."}</p>
      </section>
      <div className="space-y-3">
        <ReviewSection title={`Personal details`} onEdit={onEdit}>
          <p>{details.fullName || "Name not provided"}</p>
          <p className="mt-1 text-muted-foreground">{contact || "Contact details not provided"}</p>
          <p className="mt-1 text-muted-foreground">{[details.residentialSuburb, details.residentialCity, details.residentialProvince, details.country].filter(Boolean).join(", ")}</p>
        </ReviewSection>
        <ReviewSection title={`Work experience · ${profile.workExperience.length}`} onEdit={onEdit}>
          {profile.workExperience.length ? profile.workExperience.map((item) => <article key={item.id} className="border-b border-border py-3 first:pt-0 last:border-0"><h3 className="font-medium">{item.jobTitle} · {item.employer}</h3><p className="text-muted-foreground">{item.startDate} – {item.isCurrent ? "Present" : item.endDate || "Date not specified"}</p>{item.description && <p className="mt-2 whitespace-pre-wrap">{item.description}</p>}</article>) : <p className="text-muted-foreground">No work experience added.</p>}
        </ReviewSection>
        <ReviewSection title={`Education · ${profile.education.length}`} onEdit={onEdit}>
          {profile.education.length ? profile.education.map((item) => <article key={item.id} className="border-b border-border py-3 first:pt-0 last:border-0"><h3 className="font-medium">{item.qualification}</h3><p className="text-muted-foreground">{[item.educationLevel, item.institution, item.fieldOfStudy].filter(Boolean).join(" · ")}</p></article>) : <p className="text-muted-foreground">No education added.</p>}
        </ReviewSection>
        <ReviewSection title={`Skills · ${profile.skills.length}`} onEdit={onEdit}>
          <div className="flex flex-wrap gap-2">{profile.skills.length ? profile.skills.map((skill) => <span key={skill} className="rounded-full border border-border bg-muted px-3 py-1 text-xs">{skill}</span>) : <p className="text-muted-foreground">No skills added.</p>}</div>
        </ReviewSection>
        <ReviewSection title={`Certifications · ${profile.certifications.length}`} onEdit={onEdit}>
          {profile.certifications.map((item) => <p key={item.id} className="py-1">{item.name}{item.issuer ? ` · ${item.issuer}` : ""}</p>)}
          {!profile.certifications.length && <p className="text-muted-foreground">No certifications added.</p>}
        </ReviewSection>
        <ReviewSection title={`Projects · ${profile.projects.length}`} onEdit={onEdit}>
          {profile.projects.map((item) => <p key={item.id} className="py-1"><span className="font-medium">{item.name}</span>{item.description ? ` — ${item.description}` : ""}</p>)}
          {!profile.projects.length && <p className="text-muted-foreground">No projects added.</p>}
        </ReviewSection>
        <ReviewSection title="Additional information" onEdit={onEdit}>
          <p><span className="font-medium">Preferred role:</span> {profile.nextRole || "Not specified"}</p>
          <p className="mt-2"><span className="font-medium">Languages:</span> {profile.languages.join(", ") || "Not specified"}</p>
          <p className="mt-2"><span className="font-medium">Personal attributes:</span> {profile.personalAttributes.join(", ") || "Not specified"}</p>
        </ReviewSection>
      </div>
      <footer className="sticky bottom-3 flex flex-col gap-3 rounded-xl border border-border bg-card/95 p-4 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">Check each section before saving your profile.</p>
        <Button className="w-full sm:w-auto" disabled={saving} onClick={onSave}>{saving ? "Saving…" : "Confirm and save profile"}</Button>
      </footer>
    </main>
  );
}
