"use client";
import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { UserProfileDto } from "../server/user-profile-schema";
import { ProfileExperienceForm, type ExperienceDraft } from "./profile-experience-form";
import { displayProfileMonth } from "./profile-date-utils";
type WorkExperience = UserProfileDto["workExperience"][number];
const emptyDraft: ExperienceDraft = { title: "", employer: "", startDate: "", endDate: "", location: "", current: false, description: "" };
export function ProfileExperienceEditor({ items, onChange }: { items: WorkExperience[]; onChange: (items: WorkExperience[]) => void }) {
  const [draft, setDraft] = useState(emptyDraft);
  const add = () => {
    onChange([...items, { id: `exp-${Date.now()}`, jobTitle: draft.title.trim(), employer: draft.employer.trim(), startDate: draft.startDate, endDate: draft.current ? null : draft.endDate, isCurrent: draft.current, location: draft.location.trim() || null, description: draft.description.trim() || null, achievements: [] }]);
    setDraft(emptyDraft);
  };
  return <section className="rounded-xl border border-border bg-card p-5 text-card-foreground shadow-sm sm:p-6">
    <div className="flex items-center justify-between"><div><h2 className="text-base font-semibold">Work experience</h2><p className="mt-1 text-sm text-muted-foreground">Add roles in reverse chronological order.</p></div><span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">{items.length}</span></div>
    <ul className="mt-4 divide-y divide-border">{items.map((item) => <li key={item.id} className="flex items-start justify-between gap-3 py-3 first:pt-0"><div className="min-w-0"><p className="text-sm font-medium">{item.jobTitle} · {item.employer}</p><p className="text-sm text-muted-foreground">{displayProfileMonth(item.startDate)} – {item.isCurrent ? "Present" : displayProfileMonth(item.endDate)}{item.location ? ` · ${item.location}` : ""}</p>{item.description && <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{item.description}</p>}</div><Button variant="ghost" size="icon" aria-label={`Remove ${item.jobTitle}`} onClick={() => onChange(items.filter((entry) => entry.id !== item.id))}><X className="size-4" /></Button></li>)}{!items.length && <li className="py-2 text-sm text-muted-foreground">No work experience added yet. You can leave this section empty.</li>}</ul>
    <ProfileExperienceForm value={draft} onChange={setDraft} onAdd={add} />
  </section>;
}
