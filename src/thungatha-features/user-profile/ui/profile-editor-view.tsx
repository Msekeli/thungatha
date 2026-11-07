"use client";

import { Button } from "@/components/ui/button";
import {
  profileCompletionSchema,
  type UserProfileDto,
} from "../server/user-profile-schema";
import { ProfileEditorFields } from "./profile-editor-fields";
import { ProfileEditorSidebar } from "./profile-editor-sidebar";

export function ProfileEditorView({
  profile,
  saving,
  onChange,
  onSave,
}: {
  profile: UserProfileDto;
  saving: boolean;
  onChange: (updated: UserProfileDto) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  const complete = profileCompletionSchema.safeParse(profile).success;
  const saveLabel = saving
    ? "Saving…"
    : complete
      ? "Save Profile"
      : "Save draft";
  return (
    <div className="th-profile-editor-layout ml-0 mr-auto w-full max-w-none">
      <header className="th-profile-editor-heading border-b border-border pb-3">
        <h1 className="text-center text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Build your professional profile
        </h1>
        <p className="th-profile-heading-label text-sm font-medium text-muted-foreground">
          Your profile
        </p>
      </header>
      <div className="th-profile-editor-grid">
        <div className="th-profile-editor-main">
          <ProfileEditorFields profile={profile} onChange={onChange} />
          <div className="th-profile-mobile-actions pt-3">
            <Button className="w-full" disabled={saving} onClick={onSave}>
              {saveLabel}
            </Button>
          </div>
        </div>
        <aside className="th-profile-editor-sidebar">
          <ProfileEditorSidebar
            profile={profile}
            saving={saving}
            onSave={onSave}
          />
        </aside>
      </div>
    </div>
  );
}
