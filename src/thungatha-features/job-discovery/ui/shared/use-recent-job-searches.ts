"use client";

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "thungatha-recent-job-searches";
const CHANGE_EVENT = "thungatha:recent-job-searches-change";
const MAX_SEARCHES = 5;
const EMPTY_SEARCHES: string[] = [];

let cachedRaw: string | null | undefined;
let cachedSearches: string[] = EMPTY_SEARCHES;

function getSnapshot(): string[] {
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return EMPTY_SEARCHES;
  }
  if (raw === cachedRaw) return cachedSearches;

  cachedRaw = raw;
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    cachedSearches = Array.isArray(parsed)
      ? parsed
          .filter((item): item is string => typeof item === "string")
          .slice(0, MAX_SEARCHES)
      : EMPTY_SEARCHES;
  } catch {
    cachedSearches = EMPTY_SEARCHES;
  }
  return cachedSearches;
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}

function notifyChange() {
  cachedRaw = undefined;
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function publishSearches(searches: string[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(searches));
    notifyChange();
  } catch {
    // Search history is optional when browser storage is unavailable.
  }
}

export function useRecentJobSearches() {
  const recentSearches = useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => EMPTY_SEARCHES,
  );

  const rememberSearch = useCallback(
    (search: string) => {
      const value = search.trim();
      if (!value) return;
      const next = [
        value,
        ...recentSearches.filter(
          (item) => item.toLowerCase() !== value.toLowerCase(),
        ),
      ].slice(0, MAX_SEARCHES);
      publishSearches(next);
    },
    [recentSearches],
  );

  const clearRecentSearches = useCallback(() => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
      notifyChange();
    } catch {
      // Search history is optional when browser storage is unavailable.
    }
  }, []);

  return { recentSearches, rememberSearch, clearRecentSearches };
}
