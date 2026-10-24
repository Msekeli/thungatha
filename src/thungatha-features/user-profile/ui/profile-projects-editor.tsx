"use client";
import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { UserProfileDto } from "../server/user-profile-schema";
type Project = UserProfileDto["projects"][number];
export function ProfileProjectsEditor({ items, onChange }: { items: Project[]; onChange: (items: Project[]) => void }) {
  const [name, setName] = useState("");
  const add = () => { if (!name.trim()) return; onChange([...items, { id: `project-${Date.now()}`, name: name.trim() }]); setName(""); };
  return <section className="rounded-xl border border-border bg-card p-5 text-card-foreground shadow-sm">
    <h2 className="text-base font-semibold">Projects</h2>
    <ul className="mt-3 divide-y divide-border">{items.map((item) => <li key={item.id} className="flex items-center justify-between gap-2 py-2 text-sm"><span>{item.name}</span><Button size="icon" variant="ghost" aria-label={`Remove ${item.name}`} onClick={() => onChange(items.filter((entry) => entry.id !== item.id))}><X className="size-4" /></Button></li>)}{!items.length && <li className="py-2 text-sm text-muted-foreground">No projects added yet.</li>}</ul>
    <form className="mt-3 flex gap-2" onSubmit={(event) => { event.preventDefault(); add(); }}><Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Project name" aria-label="Project name" /><Button type="submit" disabled={!name.trim()}><Plus className="size-4" /> Add</Button></form>
  </section>;
}
