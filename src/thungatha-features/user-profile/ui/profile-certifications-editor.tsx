"use client";
import { useState } from "react";
import { Plus, Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { UserProfileDto } from "../server/user-profile-schema";
import { ProfileCertificationForm } from "./profile-certification-form";
type Entry = UserProfileDto["certifications"][number];
const blank = (): Entry => ({
  id: `cert-${Date.now()}`,
  type: undefined,
  name: "",
  issuer: null,
  issueDate: null,
  expiryDate: null,
  issuingCountry: "South Africa",
  licenceCategories: [],
  licenceNumber: null,
  endorsements: null,
});
const typeName: Record<string, string> = {
  "professional-certification": "Professional certification",
  "occupational-certificate": "Occupational or trade certificate",
  "professional-licence": "Professional licence",
  "drivers-licence": "Driver's licence",
  other: "Other",
};
export function ProfileCertificationsEditor({
  items,
  onChange,
}: {
  items: Entry[];
  onChange: (items: Entry[]) => void;
}) {
  const [draft, setDraft] = useState<Entry | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const save = () => {
    if (
      !draft?.type ||
      !draft.name.trim() ||
      (draft.type !== "drivers-licence" && !draft.issuer?.trim())
    )
      return;
    onChange(
      editingId
        ? items.map((item) => (item.id === editingId ? draft : item))
        : [...items, draft],
    );
    setDraft(null);
    setEditingId(null);
  };
  return (
    <section className="w-full rounded-xl border border-border bg-card p-5 text-card-foreground shadow-sm sm:p-6">
      <div>
        <h2 className="text-base font-semibold">Certifications and licences</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Optional. Leave this section empty if you have none. Choose the entry
          type first so the relevant fields appear.
        </p>
      </div>
      <ul className="mt-4 divide-y divide-border">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-start justify-between gap-3 py-3"
          >
            <div className="min-w-0">
              <p className="break-words text-sm font-medium">{item.name}</p>
              <p className="text-xs text-muted-foreground">
                {typeName[item.type || ""] || "Certification or licence"}
                {item.issuer ? ` · ${item.issuer}` : ""}
              </p>
              {item.licenceCategories?.length ? (
                <p className="text-xs text-muted-foreground">
                  Categories: {item.licenceCategories.join(", ")}
                </p>
              ) : null}
              {item.issueDate || item.expiryDate ? (
                <p className="text-xs text-muted-foreground">
                  {item.issueDate || "Issue date not specified"} –{" "}
                  {item.expiryDate || "No expiry date"}
                </p>
              ) : null}
            </div>
            <div className="flex shrink-0">
              <Button
                type="button"
                size="icon"
                variant="ghost"
                aria-label={`Edit ${item.name}`}
                onClick={() => {
                  setDraft({ ...item });
                  setEditingId(item.id);
                }}
              >
                <Pencil className="size-4" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                aria-label={`Remove ${item.name}`}
                onClick={() =>
                  onChange(items.filter((entry) => entry.id !== item.id))
                }
              >
                <X className="size-4" />
              </Button>
            </div>
          </li>
        ))}
        {!items.length && (
          <li className="py-2 text-sm text-muted-foreground">
            No entries added. This section is optional.
          </li>
        )}
      </ul>
      {draft ? (
        <ProfileCertificationForm
          value={draft}
          onChange={setDraft}
          onSave={save}
          onCancel={() => {
            setDraft(null);
            setEditingId(null);
          }}
          editing={Boolean(editingId)}
        />
      ) : (
        <Button
          type="button"
          className="mt-4 w-full sm:w-auto"
          variant="outline"
          onClick={() => {
            setDraft(blank());
            setEditingId(null);
          }}
        >
          <Plus className="size-4" /> Add certification or licence
        </Button>
      )}
    </section>
  );
}
