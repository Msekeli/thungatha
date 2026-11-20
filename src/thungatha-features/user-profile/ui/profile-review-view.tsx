"use client";

import { Button } from "@/components/ui/button";
import { PencilLine } from "lucide-react";
import { profileCompletionSchema, type UserProfileDto } from "../server/user-profile-schema";
import type { ReactNode } from "react";

function CvSection({ title, children, onEdit }: {
  title: string; children: ReactNode; onEdit: () => void;
}) {
  return (
    <section className="border-b border-border py-5 print:break-inside-avoid print:border-gray-300">
      <header className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold uppercase tracking-wide">{title}</h2>
        <Button className="print:hidden" type="button" size="sm" variant="ghost" onClick={onEdit}>
          <PencilLine /> Edit
        </Button>
      </header>
      <div className="text-sm leading-6">{children}</div>
    </section>
  );
}

export function ProfileReviewView({ profile, onEdit, onSave, saving }: {
  profile: UserProfileDto; onEdit: () => void; onSave: () => void; saving: boolean;
}) {
  const details = profile.personalDetails;
  const contact = [details.email, details.phone, details.location].filter(Boolean).join(" · ");
  const complete = profileCompletionSchema.safeParse(profile).success;
  return (
    <main className="mx-auto w-full max-w-4xl space-y-5 pb-10 print:max-w-none print:bg-white print:p-8 print:text-black">
      <header className="border-b-2 border-foreground pb-5 print:border-black">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground print:text-gray-600">Professional profile</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight print:text-black">{details.fullName || profile.displayName || "Your professional profile"}</h1>
        {contact && <p className="mt-2 text-sm text-muted-foreground print:text-gray-700">{contact}</p>}
        <p className="mt-1 text-sm text-muted-foreground print:text-gray-700">{[details.residentialSuburb, details.residentialCity, details.residentialProvince, details.country].filter(Boolean).join(", ")}</p>
      </header>
      <CvSection title="Professional summary" onEdit={onEdit}>
        <p className="whitespace-pre-wrap">{profile.summary || "No professional summary added yet."}</p>
      </CvSection>
      <CvSection title="Personal details" onEdit={onEdit}>
        <p>{details.fullName || "Name not provided"}</p>
        <p>{contact || "Contact details not provided"}</p>
        <p>{[details.residentialSuburb, details.residentialCity, details.residentialProvince, details.country].filter(Boolean).join(", ")}</p>\n        <p><strong>Home language:</strong> {profile.languages[0] || "Not specified"}</p>\n        <p><strong>Additional languages:</strong> {profile.languages.slice(1).join(", ") || "None added"}</p>
      </CvSection>
      <CvSection title="Work experience" onEdit={onEdit}>
        {profile.workExperience.length ? profile.workExperience.map((item) => (
          <article key={item.id} className="mb-4 break-inside-avoid last:mb-0">
            <h3 className="font-semibold">{item.jobTitle} · {item.employer}</h3>
            <p className="text-muted-foreground print:text-gray-700">{item.startDate} – {item.isCurrent ? "Present" : item.endDate || "Date not specified"}</p>
            {item.location && <p className="text-muted-foreground print:text-gray-700">{item.location}</p>}
            {item.description && <p className="mt-2 whitespace-pre-wrap">{item.description}</p>}
            {item.achievements?.length ? <ul className="mt-2 list-disc pl-5">{item.achievements.map((achievement, index) => <li key={index}>{achievement}</li>)}</ul> : null}
          </article>
        )) : <p className="text-muted-foreground">No work experience added.</p>}
      </CvSection>
      <CvSection title="Education" onEdit={onEdit}>
        {profile.education.length ? profile.education.map((item) => (
          <article key={item.id} className="mb-3 break-inside-avoid last:mb-0">
            <h3 className="font-semibold">{item.qualification}</h3>
            <p className="text-muted-foreground print:text-gray-700">{[item.educationLevel, item.institution, item.fieldOfStudy].filter(Boolean).join(" · ")}</p>
          </article>
        )) : <p className="text-muted-foreground">No education added.</p>}
      </CvSection>
      <CvSection title="Skills" onEdit={onEdit}>
        {profile.skills.length ? <p>{profile.skills.join(" · ")}</p> : <p className="text-muted-foreground">No skills added.</p>}
      </CvSection>
      <CvSection title="Certifications and licences" onEdit={onEdit}>
        {profile.certifications.length ? profile.certifications.map((item) => <p key={item.id} className="mb-2 last:mb-0"><strong>{item.name}</strong>{item.issuer ? ` · ${item.issuer}` : ""}</p>) : <p className="text-muted-foreground">No certifications added.</p>}
      </CvSection>
      <CvSection title="Projects" onEdit={onEdit}>
        {profile.projects.length ? profile.projects.map((item) => <article key={item.id} className="mb-3 last:mb-0"><h3 className="font-semibold">{item.name}</h3>{item.description && <p>{item.description}</p>}</article>) : <p className="text-muted-foreground">No projects added.</p>}
      </CvSection>
      <CvSection title="Languages and professional strengths" onEdit={onEdit}>
        <p><strong>Preferred role:</strong> {profile.nextRole || "Not specified"}</p>
        <p className="mt-2"><strong>Languages:</strong> {profile.languages.join(", ") || "Not specified"}</p>
        <p className="mt-2"><strong>Personal attributes:</strong> {profile.personalAttributes.join(", ") || "Not specified"}</p>
      </CvSection>
      <footer className="sticky bottom-3 flex flex-col gap-3 rounded-xl border border-border bg-card/95 p-4 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between print:hidden">
        <p className="text-sm text-muted-foreground">Review your complete CV before saving your profile.</p>
        <Button className="w-full sm:w-auto" disabled={saving || !complete} onClick={onSave}>{saving ? "Saving…" : "Confirm and save profile"}</Button>
      </footer>
    </main>
  );
}
