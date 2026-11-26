"use client";

import { useCallback, useEffect, useState } from "react";
import type { UserProfileDto } from "../server/user-profile-schema";
import {
  readWorkspaceCache,
  writeWorkspaceCache,
} from "@/lib/workspace-data-cache";
import { createBlankProfile, isProfileEmpty } from "./profile-defaults";

const PROFILE_CACHE_KEY = "profile";
const PROFILE_CACHE_TTL = 2 * 60 * 1000;

type ProfileMode = "empty" | "view" | "edit";

export function useProfileLoad(userId: string | null, enabled: boolean) {
  const [cached] = useState(() =>
    readWorkspaceCache<UserProfileDto>(
      userId,
      PROFILE_CACHE_KEY,
      PROFILE_CACHE_TTL,
    ),
  );
  const [profile, setProfile] = useState<UserProfileDto | null>(
    cached?.value ?? null,
  );
  const [draft, setDraft] = useState<UserProfileDto>(
    cached?.value ?? createBlankProfile(),
  );
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState("");
  const [loadFailed, setLoadFailed] = useState(false);
  const [mode, setMode] = useState<ProfileMode>(
    cached ? (isProfileEmpty(cached.value) ? "empty" : "view") : "empty",
  );

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/profile");
      if (!res.ok) throw new Error("Profile could not be loaded.");
      const json = await res.json();
      const loaded = (json.profile as UserProfileDto) || createBlankProfile();
      writeWorkspaceCache(userId, PROFILE_CACHE_KEY, loaded);
      setProfile(loaded);
      setDraft(loaded);
      setMode(isProfileEmpty(loaded) ? "empty" : "view");
      setLoadFailed(false);
      setError("");
    } catch {
      setLoadFailed(true);
      setError(
        "We couldn’t load your profile. Check your connection and try again.",
      );
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setLoadFailed(false);
    setError("");
    await fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (!enabled || cached?.fresh) return;
    void Promise.resolve().then(fetchProfile);
  }, [cached?.fresh, enabled, fetchProfile]);

  return {
    profile,
    setProfile,
    draft,
    setDraft,
    loading,
    error,
    setError,
    loadFailed,
    mode,
    setMode,
    loadProfile,
  };
}
