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
    <div className="th-profile-editor-layout">
      <div className="th-profile-editor-heading">
        <p className="text-xs font-semibold uppercase tracking-wider text-fg-muted">
          Profile · Manual entry
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-fg">
          Your professional profile
        </h1>
        <p className="mt-2 rounded-lg bg-panel-2 p-3 text-xs text-fg-muted">
          Review your details before saving. Optional sections can stay empty,
          and nothing is saved until you confirm.
        </p>
      </div>
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
