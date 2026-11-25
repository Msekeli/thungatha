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
  onReview,
  onSaveDraft,
}: {
  profile: UserProfileDto;
  saving: boolean;
  onChange: (updated: UserProfileDto) => void;
  onReview: () => void;
  onSaveDraft: (updated?: UserProfileDto) => void;
  onCancel: () => void;
}) {
  const complete = profileCompletionSchema.safeParse(profile).success;
  const reviewLabel = saving
    ? "Saving…"
    : complete
      ? "Review profile"
      : "Review draft";

  return (
    <div className="th-profile-editor-layout ml-0 mr-auto flex min-h-0 min-w-0 w-full max-w-none flex-1 flex-col gap-[18px] max-[700px]:gap-3">
      <header className="th-profile-editor-heading flex-none border-b border-border pb-3">
        <h1 className="text-center text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Build your professional profile
        </h1>
        <p className="th-profile-heading-label text-sm font-medium text-muted-foreground">
          Your profile
        </p>
      </header>
      <div className="th-profile-editor-grid min-h-0 min-w-0 flex-1 max-[700px]:grid-rows-[minmax(0,1fr)_auto] max-[700px]:gap-2">
        <div className="th-profile-editor-main">
          <ProfileEditorFields
            profile={profile}
            onChange={onChange}
            onSave={onSaveDraft}
            saving={saving}
          />
          <div className="th-profile-mobile-actions pt-3">
            <Button className="w-full" disabled={saving} onClick={onReview}>
              {reviewLabel}
            </Button>
          </div>
        </div>
        <aside className="th-profile-editor-sidebar">
          <ProfileEditorSidebar
            profile={profile}
            saving={saving}
            onSave={onReview}
          />
        </aside>
      </div>
    </div>
  );
}
