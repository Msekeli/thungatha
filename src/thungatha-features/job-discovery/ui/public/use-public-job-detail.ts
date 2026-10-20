"use client";

import { useEffect, useState } from "react";
import type { PublicJob as JobDetail } from "./public-job-types";
import { requestJobDetail } from "../request-job-detail";

export function usePublicJobDetail(selectedId: string | null) {
  const [detail, setDetail] = useState<JobDetail | null>(null);

  useEffect(() => {
    if (!selectedId) return;
    const controller = new AbortController();
    void requestJobDetail<JobDetail>(selectedId, controller.signal)
      .then(setDetail)
      .catch((reason: unknown) => {
        if (reason instanceof Error && reason.name !== "AbortError")
          setDetail(null);
      });
    return () => controller.abort();
  }, [selectedId]);

  return { detail, setDetail };
}
