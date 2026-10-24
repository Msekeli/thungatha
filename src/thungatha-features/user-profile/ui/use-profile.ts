"use client";

import { useCallback, useEffect, useState } from "react";
import type { UserProfileDto } from "../server/user-profile-schema";

export const createBlankProfile = (): UserProfileDto => ({
  displayName: null,
  personalDetails: {
    fullName: null, email: null, phone: null, location: null, country: "South Africa",
    residentialSuburb: null, residentialCity: null, residentialProvince: null,
    residentialPostalCode: null, linkedinUrl: null, portfolioUrl: null,
  },
  summary: null, workExperience: [], education: [], skills: [], certifications: [],
  projects: [], languages: [], personalAttributes: [], masterCv: null,
  confirmedAt: null, profileVersion: 1,
});

export function isProfileEmpty(p: UserProfileDto | null): boolean {
  if (!p) return true;
  const d = p.personalDetails;
  return (
    !p.displayName && !d.fullName && !d.email && !d.phone && !d.location &&
    !d.country && !d.residentialSuburb && !d.residentialCity &&
    !d.residentialProvince && !d.residentialPostalCode && !d.linkedinUrl &&
    !d.portfolioUrl && !p.summary && p.workExperience.length === 0 &&
    p.education.length === 0 && p.skills.length === 0 &&
    p.certifications.length === 0 && p.projects.length === 0 &&
    p.languages.length === 0 && p.personalAttributes.length === 0
  );
}

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
    setLoading(true); setLoadFailed(false); setError(""); setMessage("");
    try {
      const res = await fetch("/api/profile");
      if (!res.ok) throw new Error("Load failed");
      const json = await res.json();
      const p = (json.profile as UserProfileDto) || createBlankProfile();
      setProfile(p); setDraft(p);
      setMode(isProfileEmpty(p) ? "empty" : "view");
    } catch {
      setLoadFailed(true);
      setError("We couldn’t load your profile. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSave = async () => {
    setSaving(true); setError(""); setMessage("");
    try {
      const payload = {
        ...draft,
        displayName: draft.personalDetails.fullName || draft.displayName || undefined,
        confirmedAt: new Date().toISOString(),
      };
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "We couldn’t save your changes. Please try again.");
        return;
      }
      const saved = json.profile as UserProfileDto;
      setProfile(saved); setDraft(saved); setMode("view"); setMessage("Profile saved.");
    } catch {
      setError("We couldn’t save your changes. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => { void loadProfile(); }, [loadProfile]);

  return {
    profile, setProfile, draft, setDraft, loading, saving, error, message,
    loadFailed, mode, setMode, loadProfile, handleSave,
  };
}
