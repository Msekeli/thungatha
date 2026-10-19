"use client";

import { useEffect, useState } from "react";
import type { PublicJob as JobDetail } from "./public-job-types";

export function usePublicJobDetail(selectedId: string | null) {
  const [detail, setDetail] = useState<JobDetail | null>(null);

  useEffect(() => {
    if (!selectedId) return;
    const controller = new AbortController();
    fetch("/api/jobs/" + encodeURIComponent(selectedId), {
      signal: controller.signal,
      cache: "no-store",
      headers: { Accept: "application/json" },
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Listing unavailable");
        const payload = (await response.json()) as { job: JobDetail };
        setDetail(payload.job);
      })
      .catch((reason: unknown) => {
        if (reason instanceof Error && reason.name !== "AbortError")
          setDetail(null);
      });
    return () => controller.abort();
  }, [selectedId]);

  return { detail, setDetail };
}
