"use client";

import { useCallback, useEffect, useState } from "react";
import { profileCompletionSchema, type UserProfileDto } from "../server/user-profile-schema";
import { createBlankProfile, isProfileEmpty } from "./profile-defaults";
import { saveProfileDraft } from "./profile-save";
export { createBlankProfile, isProfileEmpty } from "./profile-defaults";

export function useProfile() {
  const [profile, setProfile] = useState<UserProfileDto | null>(null);
  const [draft, setDraft] = useState<UserProfileDto>(createBlankProfile());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loadFailed, setLoadFailed] = useState(false);
  const [mode, setMode] = useState<"empty" | "view" | "edit">("empty");

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setLoadFailed(false);
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/profile");
      if (!res.ok) throw new Error("Load failed");
      const json = await res.json();
      const p = (json.profile as UserProfileDto) || createBlankProfile();
      setProfile(p);
      setDraft(p);
      setMode(isProfileEmpty(p) ? "empty" : "view");
    } catch {
      setLoadFailed(true);
      setError(
        "We couldn’t load your profile. Check your connection and try again.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const result = await saveProfileDraft(draft);
      if (!result.profile) {
        setError(result.error || "We couldn’t save your changes. Please try again.");
        return;
      }
      setProfile(result.profile);
      setDraft(result.profile);
      const complete = profileCompletionSchema.safeParse(result.profile).success;
      setMode(complete ? "view" : "edit");
      setMessage(complete ? "Profile saved successfully." : "Draft saved. Complete the required personal details, professional summary, and education to save your profile.");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  return {
    profile,
    setProfile,
    draft,
    setDraft,
    loading,
    saving,
    error,
    message,
    dismissError: () => setError(""),
    dismissMessage: () => setMessage(""),
    loadFailed,
    mode,
    setMode,
    loadProfile,
    handleSave,
  };
}
