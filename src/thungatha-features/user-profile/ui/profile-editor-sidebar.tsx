"use client";
import { CheckCircle2, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { UserProfileDto } from "../server/user-profile-schema";
export function ProfileEditorSidebar({ profile, saving, onSave, onCancel }: {
  profile: UserProfileDto; saving: boolean; onSave: () => void; onCancel: () => void;
}) {
  const sections = [
    ["Personal details", Boolean(profile.personalDetails.fullName)],
    ["Professional summary", Boolean(profile.summary)],
    ["Work experience", profile.workExperience.length > 0],
    ["Education", profile.education.length > 0],
    ["Skills", profile.skills.length > 0],
  ] as const;
  const completed = sections.filter((section) => section[1]).length;
  return <section className="rounded-xl border border-border bg-card p-5 text-card-foreground shadow-sm">
    <div className="flex items-center justify-between"><h2 className="text-sm font-semibold">Profile progress</h2><span className="text-xs text-muted-foreground">{completed}/{sections.length}</span></div>
    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${completed / sections.length * 100}%` }} /></div>
    <ul className="mt-4 space-y-3">{sections.map(([label, done]) => <li key={label} className="flex items-center gap-2 text-sm">{done ? <CheckCircle2 aria-hidden="true" className="size-4 text-primary" /> : <Circle aria-hidden="true" className="size-4 text-muted-foreground" />}<span className={done ? "text-foreground" : "text-muted-foreground"}>{label}</span></li>)}</ul>
    <p className="mt-5 border-t border-border pt-4 text-xs leading-5 text-muted-foreground">You can save an incomplete draft and finish it later.</p>
    <div className="mt-4 flex flex-col gap-2"><Button className="w-full" disabled={saving} onClick={onSave}>{saving ? "Saving…" : "Save profile"}</Button><Button className="w-full" variant="outline" disabled={saving} onClick={onCancel}>Cancel</Button></div>
  </section>;
}
