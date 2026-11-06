"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "thungatha-recent-job-searches";
const MAX_SEARCHES = 5;

export function useRecentJobSearches() {
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      const parsed: unknown = stored ? JSON.parse(stored) : [];
      if (Array.isArray(parsed)) {
        setRecentSearches(parsed.filter((item): item is string => typeof item === "string").slice(0, MAX_SEARCHES));
      }
    } catch {
      // Search history is optional.
    }
  }, []);

  function rememberSearch(search: string) {
    const value = search.trim();
    if (!value) return;
    const next = [value, ...recentSearches.filter((item) => item.toLowerCase() !== value.toLowerCase())].slice(0, MAX_SEARCHES);
    setRecentSearches(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Search history is optional.
    }
  }

  function clearRecentSearches() {
    setRecentSearches([]);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Search history is optional.
    }
  }

  return { recentSearches, rememberSearch, clearRecentSearches };
}
