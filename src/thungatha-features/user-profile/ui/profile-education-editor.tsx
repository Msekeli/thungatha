"use client";
import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { UserProfileDto } from "../server/user-profile-schema";
type Education = UserProfileDto["education"][number];
const Required = () => <span className="font-normal text-destructive">(Required)</span>;
export function ProfileEducationEditor({ items, onChange }: { items: Education[]; onChange: (items: Education[]) => void }) {
  const [adding, setAdding] = useState(false);
  const [qualification, setQualification] = useState("");
  const [institution, setInstitution] = useState("");
  const add = () => {
    if (!qualification.trim() || !institution.trim()) return;
    onChange([...items, { id: `edu-${Date.now()}`, qualification: qualification.trim(), institution: institution.trim() }]);
    setQualification(""); setInstitution(""); setAdding(false);
  };
  return <section className="rounded-xl border border-border bg-card p-5 text-card-foreground shadow-sm sm:p-6">
    <div className="flex items-center justify-between"><div><h2 className="text-base font-semibold">Education</h2><p className="mt-1 text-sm text-muted-foreground">Qualifications, courses and current studies. Add only what applies.</p></div><span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">{items.length}</span></div>
    <ul className="mt-4 divide-y divide-border">{items.map((item) => <li key={item.id} className="flex items-center justify-between gap-3 py-3 first:pt-0"><div className="min-w-0"><p className="text-sm font-medium">{item.qualification}</p><p className="text-sm text-muted-foreground">{item.institution}</p></div><Button aria-label={`Remove ${item.qualification}`} variant="ghost" size="icon" onClick={() => onChange(items.filter((entry) => entry.id !== item.id))}><X className="size-4" /></Button></li>)}{!items.length && <li className="py-2 text-sm text-muted-foreground">No education added yet.</li>}</ul>
    {adding ? <div className="mt-4 grid gap-3 rounded-lg border border-border bg-muted/40 p-4"><label className="space-y-2 text-sm font-medium">Qualification <Required /><Input required value={qualification} onChange={(event) => setQualification(event.target.value)} placeholder="e.g. Diploma in Software Development" /></label><label className="space-y-2 text-sm font-medium">Institution <Required /><Input required value={institution} onChange={(event) => setInstitution(event.target.value)} placeholder="College or university" /></label><div className="flex gap-2"><Button onClick={add} disabled={!qualification.trim() || !institution.trim()}><Plus className="size-4" /> Add education</Button><Button variant="outline" onClick={() => setAdding(false)}>Cancel</Button></div></div> : <Button className="mt-4" variant="outline" onClick={() => setAdding(true)}><Plus className="size-4" /> Add education</Button>}
  </section>;
}
