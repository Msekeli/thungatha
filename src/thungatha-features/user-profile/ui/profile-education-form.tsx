"use client";

import { Button } from "@/components/ui/button";
import type { UserProfileDto } from "../server/user-profile-schema";
import { educationLevels } from "./profile-education-options";
import { ProfileEducationDates } from "./profile-education-dates";
import { ProfileEducationFields } from "./profile-education-fields";

type Education = UserProfileDto["education"][number];

export function ProfileEducationForm({
  value,
  onChange,
  onSave,
  onCancel,
  editing,
}: {
  value: Education;
  onChange: (value: Education) => void;
  onSave: () => void;
  onCancel: () => void;
  editing: boolean;
}) {
  const set = (key: keyof Education, next: string | boolean) => {
    const nullableFields: (keyof Education)[] = [
      "educationLevel",
      "fieldOfStudy",
      "startDate",
      "endDate",
    ];
    const fieldValue =
      typeof next === "boolean"
        ? next
        : nullableFields.includes(key) && !next
          ? null
          : next;
    const updated = { ...value, [key]: fieldValue } as Education;
    if (
      key === "educationLevel" &&
      (next === educationLevels[0] || next === educationLevels[1])
    ) {
      updated.fieldOfStudy = null;
      updated.startDate = null;
      updated.isCurrent = false;
    }
    onChange(updated);
  };
  const schoolLevel =
    value.educationLevel === educationLevels[0] ||
    value.educationLevel === educationLevels[1];

  return (
    <form
      className="mt-4 space-y-4 rounded-lg border border-border bg-muted/40 p-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSave();
      }}
    >
      <ProfileEducationFields
        value={value}
        schoolLevel={schoolLevel}
        onChange={set}
      />
      <ProfileEducationDates
        value={value}
        schoolLevel={schoolLevel}
        onChange={set}
      />
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          type="submit"
          disabled={
            !value.educationLevel ||
            !value.qualification?.trim() ||
            !value.institution?.trim()
          }
        >
          {editing ? "Save changes" : "Save qualification"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
