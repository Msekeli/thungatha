"use client";

import { Button } from "@/components/ui/button";
import type { UserProfileDto } from "../server/user-profile-schema";
import { ProfileEditorFields } from "./profile-editor-fields";
import { ProfileEditorSidebar } from "./profile-editor-sidebar";

export function ProfileEditorView({ profile, saving, onChange, onSave, onCancel }: {
  profile: UserProfileDto;
  saving: boolean;
  onChange: (updated: UserProfileDto) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return <div className="th-profile-editor-layout ml-0 mr-auto w-full max-w-[80rem]">
    <header className="th-profile-editor-heading space-y-2 border-b border-border pb-4">
      <p className="text-sm font-medium text-muted-foreground">Your profile</p>
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">Build your professional profile</h1>
      <p className="max-w-2xl text-sm leading-6 text-muted-foreground">Save a draft at any stage. Required fields are checked for profile completion; certifications, licences and projects are optional.</p>
      <div className="th-profile-mobile-actions flex gap-2 pt-2">
        <Button className="flex-1" disabled={saving} onClick={onSave}>{saving ? "Saving…" : "Save draft"}</Button>
        <Button className="flex-1" variant="outline" disabled={saving} onClick={onCancel}>Cancel</Button>
      </div>
    </header>
    <div className="th-profile-editor-grid">
      <ProfileEditorFields profile={profile} onChange={onChange} />
      <aside className="th-profile-editor-sidebar">
        <ProfileEditorSidebar profile={profile} saving={saving} onSave={onSave} onCancel={onCancel} />
      </aside>
    </div>
  </div>;
}
