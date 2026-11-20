"use client";
import { useState } from "react";
import { Plus, Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { UserProfileDto } from "../server/user-profile-schema";
import { ProfileCertificationForm } from "./profile-certification-form";
type Entry = UserProfileDto["certifications"][number];
const blank = (): Entry => ({
  id: `cert-${Date.now()}`, type: undefined, name: "", issuer: null,
  issueDate: null, expiryDate: null, issuingCountry: "South Africa",
  licenceCategories: [], licenceNumber: null, endorsements: null,
});
const labels: Record<string, string> = {
  "professional-certification": "Professional certification",
  "occupational-certificate": "Occupational / trade certificate",
  "professional-licence": "Professional registration",
  "drivers-licence": "South African driver's licence", other: "Other certificate",
};
export function ProfileCertificationsEditor({ items, onChange, onSave }: {
  items: Entry[]; onChange: (items: Entry[]) => void;
  onSave: (items: Entry[]) => void;
}) {
  const [draft, setDraft] = useState<Entry | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const save = () => {
    if (!draft?.type || (draft.type !== "drivers-licence" && !draft.name?.trim()) ||
      (["professional-certification", "occupational-certificate", "professional-licence"].includes(draft.type) && !draft.issuer?.trim())) return;
    const updated = editingId ? items.map((item) => item.id === editingId ? draft : item) : [...items, draft];
    onChange(updated);
    onSave(updated);
    setDraft(null); setEditingId(null);
  };
  return (
    <section className="w-full rounded-xl border border-border bg-card p-5 text-card-foreground shadow-sm sm:p-6">
      <h2 className="text-base font-semibold">Certifications and licences</h2>
      <p className="mt-1 text-sm text-muted-foreground">Optional. Add South African professional registrations, certificates, trade qualifications or driving licence details.</p>
      <ul className="mt-4 divide-y divide-border">
        {items.map((item) => <li key={item.id} className="flex items-start justify-between gap-3 py-3">
          <div className="min-w-0">
            <p className="break-words text-sm font-medium">{item.name || "South African driver's licence"}</p>
            <p className="text-xs text-muted-foreground">{labels[item.type || ""] || "Certificate"}{item.issuer ? ` · ${item.issuer}` : ""}</p>
            {item.licenceCategories?.length ? <p className="text-xs text-muted-foreground">Codes: {item.licenceCategories.join(", ")}</p> : null}
            {item.issueDate || item.expiryDate ? <p className="text-xs text-muted-foreground">{item.issueDate || "Issue date not specified"} – {item.expiryDate || "No expiry date"}</p> : null}
          </div>
          <div className="flex shrink-0">
            <Button type="button" size="icon" variant="ghost" aria-label={`Edit ${item.name}`} onClick={() => { setDraft({ ...item }); setEditingId(item.id); }}><Pencil className="size-4" /></Button>
            <Button type="button" size="icon" variant="ghost" aria-label={`Remove ${item.name}`} onClick={() => onChange(items.filter((entry) => entry.id !== item.id))}><X className="size-4" /></Button>
          </div>
        </li>)}
        {!items.length && <li className="py-2 text-sm text-muted-foreground">No entries added. This section is optional.</li>}
      </ul>
      {draft ? <ProfileCertificationForm value={draft} onChange={setDraft} onSave={save}
        onCancel={() => { setDraft(null); setEditingId(null); }} editing={Boolean(editingId)} />
        : <Button type="button" className="mt-4 w-full sm:w-auto" variant="outline"
          onClick={() => { setDraft(blank()); setEditingId(null); }}><Plus className="size-4" /> Add certificate or licence</Button>}
    </section>
  );
}
