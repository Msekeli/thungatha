"use client";

import type { UserProfileDto } from "../server/user-profile-schema";
import { ProfileEditorFields } from "./profile-editor-fields";
import { ProfileEditorSidebar } from "./profile-editor-sidebar";

export function ProfileEditorView({
  profile,
  saving,
  onChange,
  onSave,
  onCancel,
}: {
  profile: UserProfileDto;
  saving: boolean;
  onChange: (updated: UserProfileDto) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="th-profile-editor-layout mx-auto w-full max-w-6xl">
      <header className="th-profile-editor-heading space-y-2 border-b border-border pb-5">
        <p className="text-sm font-medium text-muted-foreground">Your profile</p>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Build your professional profile
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          Save a draft at any stage; optional sections can remain empty.
        </p>
        <p className="text-sm text-muted-foreground">
          Fields marked <span className="font-semibold text-destructive">Required</span>
          {" "}must be completed to add that entry. Other profile sections are optional.
        </p>
      </header>
      <div className="th-profile-editor-grid">
        <ProfileEditorFields profile={profile} onChange={onChange} />
        <aside className="th-profile-editor-sidebar">
          <ProfileEditorSidebar
            profile={profile}
            saving={saving}
            onSave={onSave}
            onCancel={onCancel}
          />
        </aside>
      </div>
    </div>
  );
}
