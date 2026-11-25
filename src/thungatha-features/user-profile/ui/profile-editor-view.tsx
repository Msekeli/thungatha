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
    <div
      className="ml-0 mr-auto flex min-h-0 min-w-0 w-full max-w-none flex-1 flex-col gap-[18px] max-[700px]:gap-3"
    >
      <header
        className="relative min-h-11 flex-none border-b border-border pb-3 max-[700px]:pt-1"
      >
        <h1
          className="text-center text-2xl font-semibold tracking-tight text-foreground sm:text-3xl max-[700px]:text-left"
        >
          Build your professional profile
        </h1>
        <p
          className="absolute left-0 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground max-[700px]:static max-[700px]:mt-1 max-[700px]:translate-y-0"
        >
          Your profile
        </p>
      </header>
      <div
        className="grid min-h-0 min-w-0 flex-1 grid-cols-[minmax(0,1fr)_minmax(310px,340px)] items-start gap-5 max-[1400px]:grid-cols-[minmax(0,1fr)_300px] max-[1400px]:gap-3.5 max-[700px]:grid-cols-1 max-[700px]:grid-rows-[minmax(0,1fr)_auto] max-[700px]:gap-2"
      >
        <div
          className="min-h-0 min-w-0 max-h-[calc(100dvh-205px)] overflow-x-hidden overflow-y-auto overscroll-y-auto pr-2 pb-6 [scrollbar-gutter:stable] max-[700px]:max-h-[calc(100dvh-220px)] max-[700px]:px-0 max-[700px]:[scrollbar-gutter:auto] max-[700px]:[-webkit-overflow-scrolling:touch]"
        >
          <ProfileEditorFields
            profile={profile}
            onChange={onChange}
            onSave={onSaveDraft}
            saving={saving}
          />
          <div className="hidden pt-3 max-[700px]:flex">
            <Button className="w-full" disabled={saving} onClick={onReview}>
              {reviewLabel}
            </Button>
          </div>
        </div>
        <aside className="min-w-0 max-[700px]:hidden">
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
