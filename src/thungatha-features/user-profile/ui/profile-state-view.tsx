"use client";

import type { Dispatch, SetStateAction } from "react";
import { Toast } from "@/components/ui/toast";
import { ProfileFormLoadState } from "./profile-load-state";
import { ProfileFormModeContent } from "./profile-mode-content";
import type { ExtractedCvFields } from "./profile-cv-extraction";
import type { useProfile } from "./use-profile";

type ProfileMode = "empty" | "view" | "edit" | "review";

export function ProfileFormStateView({
  data,
  currentMode,
  setReviewing,
  onExtracted,
  loading = false,
  loadFailed = false,
}: {
  data: ReturnType<typeof useProfile>;
  currentMode: ProfileMode;
  setReviewing: Dispatch<SetStateAction<boolean>>;
  onExtracted: (fields: ExtractedCvFields) => void;
  loading?: boolean;
  loadFailed?: boolean;
}) {
  if (loading || loadFailed)
    return (
      <ProfileFormLoadState
        loading={loading}
        error={data.error}
        onRetry={data.loadProfile}
      />
    );

  return (
    <div
      className={
        currentMode === "edit"
          ? "th-profile-form-state th-profile-form-state--edit"
          : currentMode === "view"
            ? "th-profile-form-state th-profile-form-state--view"
            : currentMode === "review"
              ? "th-profile-form-state th-profile-form-state--review"
              : "space-y-4"
      }
    >
      {data.error && (
        <Toast
          message={data.error}
          tone="error"
          onDismiss={data.dismissError}
        />
      )}
      {data.message && (
        <Toast
          message={data.message}
          tone="success"
          onDismiss={data.dismissMessage}
        />
      )}
      <ProfileFormModeContent
        data={data}
        currentMode={currentMode}
        setReviewing={setReviewing}
        onExtracted={onExtracted}
      />
    </div>
  );
}
