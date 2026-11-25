"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { UserProfileDto } from "../server/user-profile-schema";
import {
  ProfileExperienceForm,
  type ExperienceDraft,
} from "./profile-experience-form";
import { ProfileExperienceList } from "./profile-experience-list";

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
    ) {
      return;
    }
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
      <ProfileExperienceList
        items={items}
        onEdit={edit}
        onRemove={(id) =>
          onChange(items.filter((item) => item.id !== id))
        }
      />
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
