"use client";

import { Button } from "@/components/ui/button";
import {
  isEducationComplete,
  isPersonalDetailsComplete,
} from "./profile-completion-status";
import { ProfileCompletionChecklist } from "./profile-completion-checklist";
import {
  profileCompletionSchema,
  type UserProfileDto,
} from "../server/user-profile-schema";

export function ProfileEditorSidebar({
  profile,
  saving,
  onSave,
}: {
  profile: UserProfileDto;
  saving: boolean;
  onSave: () => void;
}) {
  const complete = profileCompletionSchema.safeParse(profile).success;
  const required = [
    isPersonalDetailsComplete(profile.personalDetails),
    Boolean(profile.summary?.trim()),
    isEducationComplete(profile.education),
  ];
  const completed = required.filter(Boolean).length;

  return (
    <section
      className="sticky top-4 max-h-[calc(100vh-32px)] overflow-y-auto rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm"
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">Profile completion</h2>
        <span className="text-xs text-muted-foreground">
          {completed}/{required.length} required
        </span>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${(completed / required.length) * 100}%` }}
        />
      </div>
      <ProfileCompletionChecklist profile={profile} />
      <p className="mt-3 border-t border-border pt-2 text-xs leading-4 text-muted-foreground">
        Optional sections do not block completion. Incomplete required sections
        stay unchecked.
      </p>
      <div className="mt-3">
        <Button className="w-full" disabled={saving} onClick={onSave}>
          {saving ? "Saving…" : complete ? "Review profile" : "Review draft"}
        </Button>
      </div>
    </section>
  );
}
