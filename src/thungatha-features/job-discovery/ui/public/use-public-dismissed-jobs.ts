"use client";

import { useEffect, useState } from "react";
import type { PublicJob as DismissedJob } from "./public-job-types";

const STORAGE_KEY = "thungatha-public-dismissed-jobs-v1";

export function usePublicDismissedJobs() {
  const [dismissedJobs, setDismissedJobs] = useState<DismissedJob[]>([]);
  const [dismissedLoaded, setDismissedLoaded] = useState(false);

  // Hydrate optional client-only state; public job discovery still works if storage is unavailable.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as DismissedJob[];
        if (Array.isArray(parsed)) {
          // eslint-disable-next-line react-hooks/set-state-in-effect -- Hydrate client-only state from storage.
          setDismissedJobs(parsed);
        }
      }
    } catch {
      // Local dismissal is optional.
    } finally {
      setDismissedLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!dismissedLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dismissedJobs));
    } catch {
      // Local dismissal is optional.
    }
  }, [dismissedJobs, dismissedLoaded]);

  return { dismissedJobs, setDismissedJobs, dismissedLoaded };
}
