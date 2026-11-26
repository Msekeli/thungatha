"use client";

import { useCallback, useState } from "react";
import { useProfileLoad } from "./use-profile-load";
import { useProfileSave } from "./use-profile-save";
export { createBlankProfile, isProfileEmpty } from "./profile-defaults";

export function useProfile(userId: string | null, enabled = true) {
  const data = useProfileLoad(userId, enabled);
  const [message, setMessage] = useState("");
  const { saving, handleSave } = useProfileSave({
    userId,
    draft: data.draft,
    setProfile: data.setProfile,
    setDraft: data.setDraft,
    setMode: data.setMode,
    setError: data.setError,
    setMessage,
  });
  const { loadProfile: loadDataProfile } = data;
  const loadProfile = useCallback(async () => {
    setMessage("");
    await loadDataProfile();
  }, [loadDataProfile]);

  return {
    ...data,
    loadProfile,
    saving,
    message,
    dismissError: () => data.setError(""),
    dismissMessage: () => setMessage(""),
    handleSave,
  };
}
