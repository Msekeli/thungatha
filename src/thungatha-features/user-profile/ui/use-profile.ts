"use client";

import { useCallback, useEffect, useState } from "react";
import type { UserProfileDto } from "../server/user-profile-schema";
import { createBlankProfile, isProfileEmpty } from "./profile-defaults";
import { saveProfileDraft } from "./profile-save";
import { readWorkspaceCache, writeWorkspaceCache } from "@/lib/workspace-data-cache";
export { createBlankProfile, isProfileEmpty } from "./profile-defaults";

const PROFILE_CACHE_KEY = "profile";
const PROFILE_CACHE_TTL = 2 * 60 * 1000;

export function useProfile(userId: string | null, enabled = true) {
  const cached = readWorkspaceCache<UserProfileDto>(userId, PROFILE_CACHE_KEY, PROFILE_CACHE_TTL);
  const [profile, setProfile] = useState<UserProfileDto | null>(cached?.value ?? null);
  const [draft, setDraft] = useState<UserProfileDto>(cached?.value ?? createBlankProfile());
  const [loading, setLoading] = useState(!cached);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loadFailed, setLoadFailed] = useState(false);
  const [mode, setMode] = useState<"empty" | "view" | "edit">(cached ? (isProfileEmpty(cached.value) ? "empty" : "view") : "empty");

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/profile");
      if (!res.ok) throw new Error("Load failed");
      const json = await res.json();
      const p = (json.profile as UserProfileDto) || createBlankProfile();
      writeWorkspaceCache(userId, PROFILE_CACHE_KEY, p);
      setProfile(p); setDraft(p); setMode(isProfileEmpty(p) ? "empty" : "view");
      setLoadFailed(false); setError("");
    } catch {
      setLoadFailed(true);
      setError("We couldn’t load your profile. Check your connection and try again.");
    } finally { setLoading(false); }
  }, [userId]);

  const loadProfile = useCallback(async () => {
    setLoading(true); setLoadFailed(false); setError(""); setMessage("");
    await fetchProfile();
  }, [fetchProfile]);

  const handleSave = async (confirm = false, updatedDraft = draft) => {
    setSaving(true); setError(""); setMessage("");
    try {
      const result = await saveProfileDraft(updatedDraft, confirm);
      if (!result.profile) {
        setError(result.error || "We couldn’t save your changes. Please try again.");
        return false;
      }
      writeWorkspaceCache(userId, PROFILE_CACHE_KEY, result.profile);
      setProfile(result.profile); setDraft(result.profile); setMode("edit");
      setMessage(result.profile.confirmedAt ? "Profile confirmed and saved." : "Changes saved. Your profile remains a draft until you confirm it.");
      return true;
    } finally { setSaving(false); }
  };

  useEffect(() => {
    if (!enabled) return;
    const current = readWorkspaceCache<UserProfileDto>(userId, PROFILE_CACHE_KEY, PROFILE_CACHE_TTL);
    if (current) {
      setProfile(current.value); setDraft(current.value);
      setMode(isProfileEmpty(current.value) ? "empty" : "view");
      setLoading(false);
      if (current.fresh) return;
    }
    void fetchProfile();
  }, [userId, enabled, fetchProfile]);

  return {
    profile, setProfile, draft, setDraft, loading, saving, error, message,
    dismissError: () => setError(""), dismissMessage: () => setMessage(""),
    loadFailed, mode, setMode, loadProfile, handleSave,
  };
}
