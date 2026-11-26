import { useState } from "react";
import type { UserProfileDto } from "../server/user-profile-schema";
import type { ExperienceDraft } from "./profile-experience-form";

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

export function useExperienceEditorState(
  items: Experience[],
  onChange: (items: Experience[]) => void,
) {
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

  return {
    draft,
    setDraft,
    editing: Boolean(editingId),
    save,
    edit: (item: Experience) => {
      setDraft(toDraft(item));
      setEditingId(item.id);
    },
    cancel: () => {
      setDraft(null);
      setEditingId(null);
    },
    add: () => {
      setDraft(blank());
      setEditingId(null);
    },
    remove: (id: string) => {
      onChange(items.filter((item) => item.id !== id));
    },
  };
}
