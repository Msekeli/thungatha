"use client";

import { CheckCircle2, Circle, CircleDashed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { profileCompletionSchema, type UserProfileDto } from "../server/user-profile-schema";

export function ProfileEditorSidebar({ profile, saving, onSave }: {
  profile: UserProfileDto; saving: boolean; onSave: () => void;
}) {
  const d = profile.personalDetails;
  const complete = profileCompletionSchema.safeParse(profile).success;
  const detailsDone = [d.fullName, d.email, d.phone, d.location, d.country, d.residentialSuburb, d.residentialCity, d.residentialProvince].every((v) => Boolean(v?.trim()));
  const educationDone = profile.education.some((e) => Boolean(e.educationLevel?.trim() && e.qualification.trim() && e.institution.trim()));
  const items = [
    { label: "Personal details", done: detailsDone, required: true },
    { label: "Professional summary", done: Boolean(profile.summary?.trim()), required: true },
    { label: "Work experience", done: profile.workExperience.length > 0, required: false },
    { label: "Education", done: educationDone, required: true },
    { label: "Skills", done: profile.skills.length > 0, required: false },
    { label: "Certifications and licences", done: profile.certifications.length > 0, required: false },
    { label: "Projects", done: profile.projects.length > 0, required: false },
    { label: "Preferred next role", done: Boolean(profile.nextRole?.trim()), required: false },
    { label: "Languages and personal attributes", done: profile.languages.length + profile.personalAttributes.length > 0, required: false },
  ];
  const required = items.filter((item) => item.required);
  const completed = required.filter((item) => item.done).length;
  return <section className="th-profile-completion rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm">
    <div className="flex items-center justify-between gap-2"><h2 className="text-sm font-semibold">Profile completion</h2><span className="text-xs text-muted-foreground">{completed}/{required.length} required</span></div>
    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${completed / required.length * 100}%` }} /></div>
    <ul className="th-profile-completion-list mt-4 space-y-3">
      {items.map(({ label, done, required: isRequired }) => <li key={label} className="flex items-start gap-2 text-sm">
        {done ? <CheckCircle2 aria-label="Complete" className="mt-0.5 size-4 shrink-0 text-primary" /> : isRequired ? <Circle aria-label="Required and incomplete" className="mt-0.5 size-4 shrink-0 text-muted-foreground" /> : <CircleDashed aria-label="Optional and not added" className="mt-0.5 size-4 shrink-0 text-muted-foreground" />}
        <span className={done ? "text-foreground" : "text-muted-foreground"}>{label}<span className="th-profile-completion-kind">{done ? "Complete" : isRequired ? "Required" : "Optional"}</span></span>
      </li>)}
    </ul>
    <p className="mt-3 border-t border-border pt-2 text-xs leading-4 text-muted-foreground">Optional sections do not block completion. Incomplete required sections stay unchecked.</p>
    <div className="mt-3"><Button className="w-full" disabled={saving} onClick={onSave}>{saving ? "Saving…" : complete ? "Save Profile" : "Save draft"}</Button></div>
  </section>;
}
