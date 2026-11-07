"use client";
import { useState } from "react";
import { Pencil, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { UserProfileDto } from "../server/user-profile-schema";
import {
  ProfileExperienceForm,
  type ExperienceDraft,
} from "./profile-experience-form";
import { displayProfileMonth } from "./profile-date-utils";
type Experience = UserProfileDto["workExperience"][number];
const blank = (): ExperienceDraft => ({
  title: "",
  employer: "",
  startDate: "",
  endDate: "",
  location: "",
  current: false,
  description: "",
});
const toDraft = (item: Experience): ExperienceDraft => ({
  title: item.jobTitle,
  employer: item.employer,
  startDate: item.startDate || "",
  endDate: item.endDate || "",
  location: item.location || "",
  current: item.isCurrent,
  description: item.description || "",
});
export function ProfileExperienceEditor({
  items,
  onChange,
}: {
  items: Experience[];
  onChange: (items: Experience[]) => void;
}) {
  const [draft, setDraft] = useState<ExperienceDraft | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const save = () => {
    if (
      !draft ||
      !draft.title.trim() ||
      !draft.employer.trim() ||
      !draft.startDate ||
      (!draft.current && !draft.endDate)
    )
      return;
    const entry: Experience = {
      id: editingId || `exp-${Date.now()}`,
      jobTitle: draft.title.trim(),
      employer: draft.employer.trim(),
      startDate: draft.startDate,
      endDate: draft.current ? null : draft.endDate,
      isCurrent: draft.current,
      location: draft.location.trim() || null,
      description: draft.description.trim() || null,
      achievements:
        items.find((item) => item.id === editingId)?.achievements || [],
    };
    onChange(
      editingId
        ? items.map((item) => (item.id === editingId ? entry : item))
        : [...items, entry],
    );
    setDraft(null);
    setEditingId(null);
  };
  const edit = (item: Experience) => {
    setDraft(toDraft(item));
    setEditingId(item.id);
  };
  const cancel = () => {
    setDraft(null);
    setEditingId(null);
  };
  return (
    <section className="w-full rounded-xl border border-border bg-card p-5 text-card-foreground shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Work experience</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Add each role separately, starting with your most recent.
          </p>
        </div>
        <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
          {items.length}
        </span>
      </div>
      <ul className="mt-4 divide-y divide-border">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-start justify-between gap-3 py-3 first:pt-0"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium">
                {item.jobTitle} · {item.employer}
              </p>
              <p className="text-sm text-muted-foreground">
                {displayProfileMonth(item.startDate)} –{" "}
                {item.isCurrent ? "Present" : displayProfileMonth(item.endDate)}
                {item.location ? ` · ${item.location}` : ""}
              </p>
              {item.description && (
                <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                  {item.description}
                </p>
              )}
            </div>
            <div className="flex shrink-0">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Edit ${item.jobTitle}`}
                onClick={() => edit(item)}
              >
                <Pencil className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Remove ${item.jobTitle}`}
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
            No work experience added yet. This section is optional.
          </li>
        )}
      </ul>
      {draft ? (
        <ProfileExperienceForm
          value={draft}
          onChange={setDraft}
          onSave={save}
          onCancel={cancel}
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
          <Plus className="size-4" /> Add another role
        </Button>
      )}
    </section>
  );
}
