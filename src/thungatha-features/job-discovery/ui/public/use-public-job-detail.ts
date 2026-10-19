"use client";

import { useEffect, useState } from "react";

type JobDetail = {
  id: string;
  title: string;
  employer_name: string | null;
  description: string | null;
  location_text: string | null;
  country_code: string | null;
  work_mode: string | null;
  employment_type: string | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string | null;
  updated_at: string | null;
  job_sources: { source_url: string | null; application_url: string | null; published_at: string | null; availability_status: string; provider_kind: string }[] | { source_url: string | null; application_url: string | null; published_at: string | null; availability_status: string; provider_kind: string } | null;
  state: "saved" | "dismissed" | null;
};

export function usePublicJobDetail(selectedId: string | null) {
  const [detail, setDetail] = useState<JobDetail | null>(null);

  useEffect(() => {
    if (!selectedId) return;
    const controller = new AbortController();
    fetch("/api/jobs/" + encodeURIComponent(selectedId), {
      signal: controller.signal,
      cache: "no-store",
      headers: { Accept: "application/json" },
    }).then(async (response) => {
      if (!response.ok) throw new Error("Listing unavailable");
      const payload = await response.json() as { job: JobDetail };
      setDetail(payload.job);
    }).catch((reason: unknown) => {
      if (reason instanceof Error && reason.name !== "AbortError") setDetail(null);
    });
    return () => controller.abort();
  }, [selectedId]);

  return { detail, setDetail };
}
