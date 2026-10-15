"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Skeleton } from "@/components/ui/skeleton";

type ProfileResponse = {
  profile: { displayName: string | null };
};

export function ProfileForm() {
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loadFailed, setLoadFailed] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setLoadFailed(false);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/profile");

      if (!response.ok) {
        throw new Error("Profile request failed");
      }

      const result = (await response.json()) as ProfileResponse;

      if (!result.profile) {
        throw new Error("Profile response was invalid");
      }

      setDisplayName(result.profile.displayName ?? "");
    } catch {
      setLoadFailed(true);
      setError(
        "We couldn’t load your profile. Check your connection and try again.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadProfile();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [loadProfile, loadAttempt]);

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

      let result: ProfileResponse | { error: string };

      try {
        result = (await response.json()) as ProfileResponse | { error: string };
      } catch {
        throw new Error("save-failed");
      }

      if (!response.ok) {
        if ("error" in result && typeof result.error === "string") {
          setError(result.error);
        } else {
          setError("We couldn’t save your changes. Please try again.");
        }

        return;
      }

      if (!("profile" in result) || !result.profile) {
        setError("We couldn’t save your changes. Please try again.");
        return;
      }

      setDisplayName(result.profile.displayName ?? "");
      setMessage("Profile saved.");
    } catch {
      setError(
        "We couldn’t save your changes. Check your connection and try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div
        className="mt-6 space-y-4"
        aria-busy="true"
        aria-label="Loading profile"
      >
        <p role="status" className="sr-only">
          Loading your profile…
        </p>

        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-11 w-full" />
        </div>

        <Skeleton className="h-10 w-32" />
      </div>
    );
  }

  if (loadFailed) {
    return (
      <div className="mt-6 space-y-3">
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>

        <button
          type="button"
          onClick={() => setLoadAttempt((attempt) => attempt + 1)}
          className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4" aria-busy={saving}>
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
        type="submit"
        disabled={saving}
        className="rounded-lg bg-brand-ink px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-wait disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save profile"}
      </button>

      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}

      {message && (
        <p role="status" className="text-sm font-medium text-teal-800">
          {message}
        </p>
      )}
    </form>
  );
}
