"use client";

import { Button } from "@/components/ui/button";
import type { UserProfileDto } from "../server/user-profile-schema";
import { ProfileCertificationDates } from "./profile-certification-dates";
import { ProfileCertificationFields } from "./profile-certification-fields";
import { ProfileCertificationLicense } from "./profile-certification-license";

type Entry = UserProfileDto["certifications"][number];

export function ProfileCertificationForm({
  value,
  onChange,
  onSave,
  onCancel,
  editing,
}: {
  value: Entry;
  onChange: (value: Entry) => void;
  onSave: () => void;
  onCancel: () => void;
  editing: boolean;
}) {
  const driver = value.type === "drivers-licence";
  const professional = value.type === "professional-licence";
  const needsIssuer = !driver && value.type !== "other";
  const set = (key: keyof Entry, next: string | string[]) => {
    const fieldValue = key === "name" ? next : next || null;
    onChange({ ...value, [key]: fieldValue } as Entry);
  };
  const setType = (type: string) => {
    onChange({
      ...value,
      type: type as Entry["type"],
      name:
        type === "drivers-licence"
          ? "South African driver's licence"
          : value.name,
      issuingCountry: type === "drivers-licence" ? "South Africa" : null,
      licenceCategories:
        type === "drivers-licence" ? value.licenceCategories || [] : [],
    });
  };
  const toggleCategory = (code: string, checked: boolean) => {
    set(
      "licenceCategories",
      checked
        ? [...(value.licenceCategories || []), code]
        : (value.licenceCategories || []).filter((item) => item !== code),
    );
  };

  return (
    <form
      className="mt-4 space-y-4 rounded-lg border border-border bg-muted/40 p-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSave();
      }}
    >
      <ProfileCertificationFields
        value={value}
        driver={driver}
        professional={professional}
        needsIssuer={needsIssuer}
        onSet={set}
        onSetType={setType}
      />
      {driver && (
        <ProfileCertificationLicense value={value} onToggle={toggleCategory} />
      )}
      {value.type && <ProfileCertificationDates value={value} onChange={set} />}
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          type="submit"
          disabled={
            !value.type ||
            (!driver && !value.name?.trim()) ||
            (needsIssuer && !value.issuer?.trim())
          }
        >
          {editing
            ? "Save changes"
            : driver
              ? "Save licence"
              : "Save certificate"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
