"use client";

import { useEffect, type RefObject } from "react";
import type { Feed } from "../job-discovery-utils";

export function useInfiniteJobPagination(
  targetRef: RefObject<HTMLDivElement | null>,
  loading: boolean,
  feed: Feed | null,
  page: number,
  setPage: (update: (current: number) => number) => void,
) {
  useEffect(() => {
    const target = targetRef.current;
    if (
      !target ||
      loading ||
      !feed ||
      page >= feed.totalPages ||
      typeof IntersectionObserver === "undefined"
    )
      return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setPage((current) =>
            current < feed.totalPages ? current + 1 : current,
          );
        }
      },
      { root: null, rootMargin: "500px 0px", threshold: 0 },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [targetRef, loading, feed, page, setPage]);
}
