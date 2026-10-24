"use client";
import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { UserProfileDto } from "../server/user-profile-schema";
type Certification = UserProfileDto["certifications"][number];
export function ProfileCertificationsEditor({ items, onChange }: { items: Certification[]; onChange: (items: Certification[]) => void }) {
  const [name, setName] = useState("");
  const add = () => { if (!name.trim()) return; onChange([...items, { id: `cert-${Date.now()}`, name: name.trim() }]); setName(""); };
  return <section className="w-full rounded-xl border border-border bg-card p-5 text-card-foreground shadow-sm sm:p-6">
    <h2 className="text-base font-semibold">Certifications and licences</h2>
    <p className="mt-1 text-sm text-muted-foreground">Optional. Skip this section if you do not have any certifications or licences. A name is required only when you choose to add an entry.</p>
    <ul className="mt-3 divide-y divide-border">{items.map((item) => <li key={item.id} className="flex items-center justify-between gap-2 py-2 text-sm"><span className="min-w-0 break-words">{item.name}</span><Button type="button" size="icon" variant="ghost" aria-label={`Remove ${item.name}`} onClick={() => onChange(items.filter((entry) => entry.id !== item.id))}><X className="size-4" /></Button></li>)}{!items.length && <li className="py-2 text-sm text-muted-foreground">No certifications or licences added. You can leave this section empty.</li>}</ul>
    <form className="mt-4 space-y-3" onSubmit={(event) => { event.preventDefault(); add(); }}><label className="block space-y-2 text-sm font-medium">Certification or licence name <span className="font-normal text-destructive">(Required to add)</span><Input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Certification or licence" /></label><Button type="submit" className="w-full sm:w-auto" disabled={!name.trim()}><Plus className="size-4" /> Add certification or licence</Button></form>
  </section>;
}
