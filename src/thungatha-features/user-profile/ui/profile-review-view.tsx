"use client";

import { Button } from "@/components/ui/button";
import {
  profileCompletionSchema,
  type UserProfileDto,
} from "../server/user-profile-schema";
import { ProfileReviewSection } from "./profile-review-section";
import { ProfileReviewWork } from "./profile-review-work";
import { ProfileReviewSkills } from "./profile-review-skills";
import { ProfileReviewExtras } from "./profile-review-extras";

export function ProfileReviewView({
  profile,
  onEdit,
  onSave,
  saving,
}: {
  profile: UserProfileDto;
  onEdit: () => void;
  onSave: () => void;
  saving: boolean;
}) {
  const details = profile.personalDetails;
  const contact = [details.email, details.phone, details.location]
    .filter(Boolean)
    .join(" · ");
  const address = [
    details.residentialSuburb,
    details.residentialCity,
    details.residentialProvince,
    details.country,
  ]
    .filter(Boolean)
    .join(", ");
  const complete = profileCompletionSchema.safeParse(profile).success;

  return (
    <main className="mx-auto w-full max-w-4xl space-y-5 pb-10 print:max-w-none print:bg-white print:p-8 print:text-black">
      <header className="border-b-2 border-foreground pb-5 print:border-black">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground print:text-gray-600">
          Professional profile
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight print:text-black">
          {details.fullName || profile.displayName || "Your professional profile"}
        </h1>
        {contact && (
          <p className="mt-2 text-sm text-muted-foreground print:text-gray-700">
            {contact}
          </p>
        )}
        <p className="mt-1 text-sm text-muted-foreground print:text-gray-700">
          {address}
        </p>
      </header>
      <ProfileReviewSection title="Professional summary" onEdit={onEdit}>
        <p className="whitespace-pre-wrap">
          {profile.summary || "No professional summary added yet."}
        </p>
      </ProfileReviewSection>
      <ProfileReviewSection title="Personal details" onEdit={onEdit}>
        <p>{details.fullName || "Name not provided"}</p>
        <p>{contact || "Contact details not provided"}</p>
        <p>{address}</p>
        <p>
          <strong>Home language:</strong>{" "}
          {profile.languages[0] || "Not specified"}
        </p>
        <p>
          <strong>Additional languages:</strong>{" "}
          {profile.languages.slice(1).join(", ") || "None added"}
        </p>
      </ProfileReviewSection>
      <ProfileReviewWork profile={profile} onEdit={onEdit} />
      <ProfileReviewSkills profile={profile} onEdit={onEdit} />
      <ProfileReviewExtras profile={profile} onEdit={onEdit} />
      <footer className="sticky bottom-3 flex flex-col gap-3 rounded-xl border border-border bg-card/95 p-4 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between print:hidden">
        <p className="text-sm text-muted-foreground">
          Review your complete CV before saving your profile.
        </p>
        <Button
          className="w-full sm:w-auto"
          disabled={saving || !complete}
          onClick={onSave}
        >
          {saving ? "Saving…" : "Confirm and save profile"}
        </Button>
      </footer>
    </main>
  );
}
