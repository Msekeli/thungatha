"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Toast } from "@/components/ui/toast";
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
    dismissError,
    dismissMessage,
    loadFailed,
    mode,
    setMode,
    loadProfile,
    handleSave,
  } = useProfile();
  const currentMode = initialMode || mode;

  if (loading)
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

  if (loadFailed)
    return (
      <div className="space-y-3 rounded-xl border border-line bg-panel p-6 text-center">
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

  return (
    <div
      className={
        currentMode === "edit"
          ? "th-profile-form-state th-profile-form-state--edit"
          : "space-y-4"
      }
    >
      {error && <Toast message={error} tone="error" onDismiss={dismissError} />}
      {message && (
        <Toast
          message={message}
          tone={message.startsWith("Draft saved") ? "warning" : "success"}
          onDismiss={dismissMessage}
        />
      )}
      {currentMode === "empty" && (
        <ProfileEmptyState
          onStartManualEntry={() => setMode("edit")}
          onExtracted={(fields) => {
            setDraft({
              ...draft,
              displayName: draft.displayName || fields.fullName,
              personalDetails: {
                ...draft.personalDetails,
                fullName: draft.personalDetails.fullName || fields.fullName,
                email: draft.personalDetails.email || fields.email,
                phone: draft.personalDetails.phone || fields.phone,
                linkedinUrl:
                  draft.personalDetails.linkedinUrl || fields.linkedinUrl,
                portfolioUrl:
                  draft.personalDetails.portfolioUrl || fields.portfolioUrl,
              },
              summary: draft.summary || fields.summary,
              skills: draft.skills.length ? draft.skills : fields.skills,
              workExperience: draft.workExperience.length
                ? draft.workExperience
                : fields.workExperience,
              education: draft.education.length
                ? draft.education
                : fields.education,
            });
            setMode("edit");
          }}
        />
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
