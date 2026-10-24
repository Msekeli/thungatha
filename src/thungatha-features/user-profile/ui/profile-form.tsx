"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { ProfileEmptyState } from "./profile-empty-state";
import { ProfileSavedView } from "./profile-saved-view";
import { ProfileEditorView } from "./profile-editor-view";
import { useProfile } from "./use-profile";

export function ProfileForm({
  initialMode,
}: {
  initialMode?: "empty" | "view" | "edit";
}) {
  const {
    profile,
    draft,
    setDraft,
    loading,
    saving,
    error,
    message,
    loadFailed,
    mode,
    setMode,
    loadProfile,
    handleSave,
  } = useProfile();

  const currentMode = initialMode || mode;

  if (loading) {
    return (
      <div
        className="space-y-4 py-6"
        aria-busy="true"
        aria-label="Loading profile"
      >
        <p role="status" className="sr-only">
          Loading your profile…
        </p>
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  if (loadFailed) {
    return (
      <div className="rounded-xl border border-line bg-panel p-6 text-center space-y-3">
        <p role="alert" className="text-sm text-warn">
          {error}
        </p>
        <button
          type="button"
          onClick={() => void loadProfile()}
          className="rounded-lg border border-line px-4 py-2 text-xs font-semibold text-fg hover:bg-panel-2"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div
      className={
        currentMode === "edit"
          ? "th-profile-form-state th-profile-form-state--edit"
          : "space-y-4"
      }
    >
      {error && (
        <div className="rounded-xl border border-warn/40 bg-warn-bg/20 p-4">
          <p role="alert" className="text-xs text-warn">
            {error}
          </p>
        </div>
      )}
      {message && (
        <div className="rounded-xl border border-accent/40 bg-accent/15 p-4">
          <p role="status" className="text-xs font-medium text-accent">
            {message}
          </p>
        </div>
      )}

      {currentMode === "empty" && (
        <ProfileEmptyState onStartManualEntry={() => setMode("edit")} />
      )}
      {currentMode === "view" && profile && (
        <ProfileSavedView
          profile={profile}
          onEdit={() => {
            setDraft(profile);
            setMode("edit");
          }}
        />
      )}
      {currentMode === "edit" && (
        <ProfileEditorView
          profile={draft}
          saving={saving}
          onChange={setDraft}
          onSave={handleSave}
          onCancel={() =>
            setMode(
              profile &&
                (profile.displayName || profile.personalDetails.fullName)
                ? "view"
                : "empty",
            )
          }
        />
      )}
    </div>
  );
}
