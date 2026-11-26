"use client";

import type { Dispatch, SetStateAction } from "react";
import { ProfileEmptyState } from "./profile-empty-state";
import { ProfileSavedView } from "./profile-saved-view";
import { ProfileEditorView } from "./profile-editor-view";
import { ProfileReviewView } from "./profile-review-view";
import type { ExtractedCvFields } from "./profile-cv-extraction";
import type { useProfile } from "./use-profile";

type ProfileMode = "empty" | "view" | "edit" | "review";

export function ProfileFormModeContent({
  data,
  currentMode,
  setReviewing,
  onExtracted,
}: {
  data: ReturnType<typeof useProfile>;
  currentMode: ProfileMode;
  setReviewing: Dispatch<SetStateAction<boolean>>;
  onExtracted: (fields: ExtractedCvFields) => void;
}) {
  const savedProfile = data.profile;

  return (
    <>
      {currentMode === "empty" && (
        <ProfileEmptyState
          onStartManualEntry={() => data.setMode("edit")}
          onExtracted={onExtracted}
        />
      )}
      {currentMode === "review" && (
        <ProfileReviewView
          profile={data.draft}
          saving={data.saving}
          onEdit={() => {
            setReviewing(false);
            data.setMode("edit");
          }}
          onSave={async () => {
            if (await data.handleSave(true)) setReviewing(false);
          }}
        />
      )}
      {currentMode === "view" && savedProfile && (
        <ProfileSavedView
          profile={savedProfile}
          onEdit={() => {
            data.setDraft(savedProfile);
            data.setMode("edit");
          }}
        />
      )}
      {currentMode === "edit" && (
        <ProfileEditorView
          profile={data.draft}
          saving={data.saving}
          onChange={data.setDraft}
          onReview={() => setReviewing(true)}
          onSaveDraft={(updated) => void data.handleSave(false, updated)}
          onCancel={() =>
            data.setMode(
              data.profile &&
                (data.profile.displayName ||
                  data.profile.personalDetails.fullName)
                ? "view"
                : "empty",
            )
          }
        />
      )}
    </>
  );
}
