"use client";
import type { UserProfileDto } from "../server/user-profile-schema";
import { ProfileEditorFields } from "./profile-editor-fields";
import { ProfileEditorSidebar } from "./profile-editor-sidebar";
export function ProfileEditorView({ profile, saving, onChange, onSave, onCancel }: {
  profile: UserProfileDto; saving: boolean; onChange: (updated: UserProfileDto) => void; onSave: () => void; onCancel: () => void;
}) {
  return <div className="mx-auto w-full max-w-6xl space-y-6">
    <header className="space-y-2 border-b border-border pb-5">
      <p className="text-sm font-medium text-muted-foreground">Your profile</p>
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">Build your professional profile</h1>
      <p className="max-w-2xl text-sm leading-6 text-muted-foreground">Keep your experience and skills in one place. Save a draft at any stage; optional sections can remain empty.</p>
    </header>
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_17rem]">
      <ProfileEditorFields profile={profile} onChange={onChange} />
      <aside className="lg:sticky lg:top-6"><ProfileEditorSidebar profile={profile} saving={saving} onSave={onSave} onCancel={onCancel} /></aside>
    </div>
  </div>;
}
