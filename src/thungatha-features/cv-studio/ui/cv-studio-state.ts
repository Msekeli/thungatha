"use client";

import { useCallback, useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import {
  readWorkspaceCache,
  writeWorkspaceCache,
} from "@/lib/workspace-data-cache";
import { loadCvStudio } from "./cv-studio-api";
import type { State } from "./cv-studio-types";

const CV_STUDIO_CACHE_KEY = "cv-studio";
const CV_STUDIO_CACHE_TTL = 2 * 60 * 1000;

export function useCvStudioState(userId: string | null, enabled: boolean) {
  const cached = readWorkspaceCache<State>(
    userId,
    CV_STUDIO_CACHE_KEY,
    CV_STUDIO_CACHE_TTL,
  );
  const [state, setStateInternal] = useState<State>(
    cached?.value ?? { status: "loading" },
  );

  const setState: Dispatch<SetStateAction<State>> = useCallback(
    (next) => {
      setStateInternal((current) => {
        const resolved = typeof next === "function" ? next(current) : next;
        if (resolved.status !== "loading" && resolved.status !== "error") {
          writeWorkspaceCache(userId, CV_STUDIO_CACHE_KEY, resolved);
        }
        return resolved;
      });
    },
    [userId],
  );

  const load = useCallback(
    async (force = false) => {
      const current = readWorkspaceCache<State>(
        userId,
        CV_STUDIO_CACHE_KEY,
        CV_STUDIO_CACHE_TTL,
      );
      if (!force && current) {
        setState(current.value);
        if (current.fresh) return;
      } else if (!current) {
        setState({ status: "loading" });
      }
      try {
        setState(await loadCvStudio());
      } catch (cause) {
        setState({
          status: "error",
          message:
            cause instanceof Error
              ? cause.message
              : "CV Studio could not load.",
        });
      }
    },
    [setState, userId],
  );

  useEffect(() => {
    if (enabled) void Promise.resolve().then(() => load());
  }, [enabled, load]);

  return { state, setState, load };
}
