"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { UserProfileDto } from "../server/user-profile-schema";
import { ProfileExperienceForm } from "./profile-experience-form";
import { ProfileExperienceList } from "./profile-experience-list";
import { useExperienceEditorState } from "./experience-editor-state";

type Experience = UserProfileDto["workExperience"][number];

export function ProfileExperienceEditor({
  items,
  onChange,
}: {
  items: Experience[];
  onChange: (items: Experience[]) => void;
}) {
  const editor = useExperienceEditorState(items, onChange);

  return (
    <section className="w-full rounded-xl border border-border bg-card p-5 text-card-foreground shadow-sm sm:p-6">
      <ProfileExperienceList
        items={items}
        onEdit={editor.edit}
        onRemove={editor.remove}
      />
      {editor.draft ? (
        <ProfileExperienceForm
          value={editor.draft}
          onChange={editor.setDraft}
          onSave={editor.save}
          onCancel={editor.cancel}
          editing={editor.editing}
        />
      ) : (
        <Button
          type="button"
          className="mt-4 w-full sm:w-auto"
          variant="outline"
          onClick={editor.add}
        >
          <Plus className="size-4" /> Add another role
        </Button>
      )}
    </section>
  );
}
