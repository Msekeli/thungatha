"use client";

import { useEffect, useState, type FormEvent } from "react";

type ProfileResponse = { profile: { displayName: string | null } };

export function ProfileForm() {
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/profile")
      .then(async (response) => {
        if (!response.ok) throw new Error("Profile could not be loaded.");
        return (await response.json()) as ProfileResponse;
      })
      .then(({ profile }) => {
        if (active) setDisplayName(profile.displayName ?? "");
      })
      .catch(() => {
        if (active)
          setError("Your profile could not be loaded. Refresh to try again.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName }),
      });
      const result = (await response.json()) as
        ProfileResponse | { error: string };
      if (!response.ok)
        throw new Error(
          "error" in result ? result.error : "Profile could not be saved.",
        );
      if (!("profile" in result))
        throw new Error("Profile could not be saved.");
      setDisplayName(result.profile.displayName ?? "");
      setMessage("Profile saved.");
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Profile could not be saved.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 space-y-4"
      aria-busy={loading || saving}
    >
      {loading ? (
        <p role="status" className="text-sm text-muted">
          Loading your profile…
        </p>
      ) : (
        <>
          <div className="space-y-2">
            <label
              htmlFor="display-name"
              className="block text-sm font-medium text-slate-800"
            >
              Display name
            </label>
            <input
              id="display-name"
              name="displayName"
              autoComplete="name"
              maxLength={100}
              required
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20"
            />
          </div>
          <button
            disabled={saving}
            className="rounded-lg bg-brand-ink px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-wait disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save profile"}
          </button>
        </>
      )}
      {message && (
        <p role="status" className="text-sm font-medium text-teal-800">
          {message}
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm font-medium text-red-700">
          {error}
        </p>
      )}
    </form>
  );
}
