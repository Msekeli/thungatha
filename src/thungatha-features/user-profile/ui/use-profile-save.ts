"use client";

import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { UserProfileDto } from "../server/user-profile-schema";
import { writeWorkspaceCache } from "@/lib/workspace-data-cache";
import { saveProfileDraft } from "./profile-save";

type ProfileMode = "empty" | "view" | "edit";

export function useProfileSave({
  userId,
  draft,
  setProfile,
  setDraft,
  setMode,
  setError,
  setMessage,
}: {
  userId: string | null;
  draft: UserProfileDto;
  setProfile: Dispatch<SetStateAction<UserProfileDto | null>>;
  setDraft: Dispatch<SetStateAction<UserProfileDto>>;
  setMode: Dispatch<SetStateAction<ProfileMode>>;
  setError: Dispatch<SetStateAction<string>>;
  setMessage: Dispatch<SetStateAction<string>>;
}) {
  const [saving, setSaving] = useState(false);

  async function handleSave(confirm = false, updatedDraft = draft) {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const result = await saveProfileDraft(updatedDraft, confirm);
      if (!result.profile) {
        setError(
          result.error || "We couldn’t save your changes. Please try again.",
        );
        return false;
      }
      writeWorkspaceCache(userId, "profile", result.profile);
      setProfile(result.profile);
      setDraft(result.profile);
      setMode("edit");
      setMessage(
        result.profile.confirmedAt
          ? "Profile confirmed and saved."
          : "Changes saved. Your profile remains a draft until you confirm it.",
      );
      return true;
    } finally {
      setSaving(false);
    }
  }

  return { saving, handleSave };
}
