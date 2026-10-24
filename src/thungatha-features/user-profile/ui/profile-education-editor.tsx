"use client";
import { useState } from "react";
import { Plus, Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { UserProfileDto } from "../server/user-profile-schema";
import { ProfileEducationForm } from "./profile-education-form";
type Education = UserProfileDto["education"][number];
const blank = (): Education => ({ id: `edu-${Date.now()}`, educationLevel: "", qualification: "", institution: "", fieldOfStudy: null, startDate: null, endDate: null, isCurrent: false });
export function ProfileEducationEditor({ items, onChange }: { items: Education[]; onChange: (items: Education[]) => void }) {
  const [draft, setDraft] = useState<Education | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const save = () => {
    if (!draft?.educationLevel || !draft.qualification.trim() || !draft.institution.trim()) return;
    onChange(editingId ? items.map((item) => item.id === editingId ? draft : item) : [...items, draft]);
    setDraft(null); setEditingId(null);
  };
  const edit = (item: Education) => { setDraft({ ...item }); setEditingId(item.id); };
  const cancel = () => { setDraft(null); setEditingId(null); };
  return <section className="w-full rounded-xl border border-border bg-card p-5 text-card-foreground shadow-sm sm:p-6">
    <div className="flex items-start justify-between gap-3"><div><h2 className="text-base font-semibold">Education</h2><p className="mt-1 text-sm text-muted-foreground">Add each qualification separately. At least one complete entry is required to finish your profile.</p></div><span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">{items.length}</span></div>
    <ul className="mt-4 divide-y divide-border">{items.map((item) => <li key={item.id} className="flex items-start justify-between gap-3 py-3 first:pt-0"><div className="min-w-0"><p className="text-sm font-medium">{item.qualification}</p><p className="text-sm text-muted-foreground">{item.educationLevel || "Education level not selected"} · {item.institution}</p>{item.fieldOfStudy && <p className="text-sm text-muted-foreground">{item.fieldOfStudy}</p>}<p className="text-xs text-muted-foreground">{item.startDate || "Start date not specified"} – {item.isCurrent ? `Currently studying${item.endDate ? ` · expected ${item.endDate}` : ""}` : item.endDate || "End date not specified"}</p></div><div className="flex shrink-0"><Button type="button" size="icon" variant="ghost" aria-label={`Edit ${item.qualification}`} onClick={() => edit(item)}><Pencil className="size-4" /></Button><Button type="button" size="icon" variant="ghost" aria-label={`Remove ${item.qualification}`} onClick={() => onChange(items.filter((entry) => entry.id !== item.id))}><X className="size-4" /></Button></div></li>)}{!items.length && <li className="py-2 text-sm text-muted-foreground">No education added yet.</li>}</ul>
    {draft ? <ProfileEducationForm value={draft} onChange={setDraft} onSave={save} onCancel={cancel} editing={Boolean(editingId)} /> : <Button type="button" className="mt-4 w-full sm:w-auto" variant="outline" onClick={() => { setDraft(blank()); setEditingId(null); }}><Plus className="size-4" /> Add another qualification</Button>}
  </section>;
}
