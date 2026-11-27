import type { SupabaseClient } from "@supabase/supabase-js";
import type { JobFeedQuery } from "./job-feed-query-schema";
import { readUserJobStates } from "./job-state-repository";
import { readEmployerDismissals } from "./job-feed-dismissals";
import { enqueueVisibleJobAssessments } from "./job-ai-queue";
import { readJobFeedRows } from "./job-feed-page-data";
import { buildJobFeedResponseRows } from "./job-feed-response-rows";

export async function readJobFeed(
  db: SupabaseClient,
  userId: string | null,
  input: JobFeedQuery,
  statesOnly: boolean,
) {
  const states = userId ? await readUserJobStates(db, userId, input.state) : [];
  const { dismissals, dismissalsAvailable } = await readEmployerDismissals(
    db,
    userId,
  );
  if (statesOnly) return { states, employerDismissals: dismissals };
  if ((!userId || !states.length) && input.state !== "all") {
    return {
      jobs: [],
      page: input.page,
      pageSize: input.pageSize,
      total: 0,
      totalPages: 0,
    };
  }

  const queryOpts = {
    userId,
    states,
    dismissedEmployerKeys: dismissals.map((d) => d.employer_key),
    employerDismissalsAvailable: dismissalsAvailable,
  };
  let profileVersion: number | null = null;
  let hasProfileError = false;
  if (userId) {
    const pRes = await db
      .from("profiles")
      .select("profile_version,confirmed_at")
      .eq("user_id", userId)
      .maybeSingle();
    if (pRes.error) {
      console.error("[job-feed-reader] Failed to read profile:", pRes.error);
      hasProfileError = true;
    } else if (pRes.data?.confirmed_at)
      profileVersion = pRes.data.profile_version ?? 1;
  }

  const { data, count, rankWhole, from } = await readJobFeedRows(
    db,
    input,
    queryOpts,
    profileVersion,
  );

  // Enqueue the complete set of jobs returned for this feed page. Database
  // deduplication prevents duplicate work; accepted tasks are not capped.
  if (userId && profileVersion !== null && data.length) {
    const assessmentCandidates = rankWhole
      ? data.slice(from, from + input.pageSize)
      : data;
    try {
      await enqueueVisibleJobAssessments(
        userId,
        assessmentCandidates.map((job) => job.id),
      );
    } catch (error) {
      console.error("[job-feed-reader] Could not queue assessments:", error);
    }
  }

  const safeJobs = await buildJobFeedResponseRows({
    db,
    userId,
    profileVersion,
    data,
    states,
    hasProfileError,
    rankWhole,
    from,
    pageSize: input.pageSize,
  });
  return {
    jobs: safeJobs,
    page: input.page,
    pageSize: input.pageSize,
    total: count,
    totalPages: Math.ceil(count / input.pageSize),
  };
}
