import { createHash } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { JobFeedQuery } from "./job-feed-query-schema";
import { readUserJobStates } from "./job-state-repository";
import { buildFeedJobQuery } from "./job-feed-query-builder";
import { relevanceOrder, type FeedJob } from "./job-feed-sorting";
import { fetchFeedAssessmentsAndQueue } from "./job-feed-assessments";
import { resolveJobMatchStatus } from "./job-feed-status";
import { readEmployerDismissals } from "./job-feed-dismissals";
import { enqueueVisibleJobAssessments } from "./job-ai-queue";

const BATCH_SIZE = 500;

export async function readJobFeed(db: SupabaseClient, userId: string | null, input: JobFeedQuery, statesOnly: boolean) {
  const states = userId ? await readUserJobStates(db, userId, input.state) : [];
  const { dismissals, dismissalsAvailable } = await readEmployerDismissals(db, userId);
  if (statesOnly) return { states, employerDismissals: dismissals };
  if ((!userId || !states.length) && input.state !== "all") {
    return { jobs: [], page: input.page, pageSize: input.pageSize, total: 0, totalPages: 0 };
  }

  const queryOpts = { userId, states, dismissedEmployerKeys: dismissals.map((d) => d.employer_key), employerDismissalsAvailable: dismissalsAvailable };
  let profileVersion: number | null = null; let hasProfileError = false;
  if (userId) {
    const pRes = await db.from("profiles").select("profile_version,confirmed_at").eq("user_id", userId).maybeSingle();
    if (pRes.error) { console.error("[job-feed-reader] Failed to read profile:", pRes.error); hasProfileError = true; }
    else if (pRes.data?.confirmed_at) profileVersion = pRes.data.profile_version ?? 1;
  }

  let data: FeedJob[] = [];
  let count = 0;
  let rankWhole = false;
  const from = (input.page - 1) * input.pageSize;

  if (input.sortOrder === "relevance" && profileVersion !== null) {
    for (let offset = 0; ; offset += BATCH_SIZE) {
      const bRes = await buildFeedJobQuery(db, input, queryOpts)
        .order("published_at", { ascending: false, nullsFirst: false }).order("updated_at", { ascending: false })
        .order("id", { ascending: true }).range(offset, offset + BATCH_SIZE - 1);
      if (bRes.error) throw bRes.error;
      const batch = (bRes.data ?? []) as FeedJob[];
      data.push(...batch);
      count = bRes.count ?? data.length;
      if ((bRes.count !== null && data.length >= bRes.count) || batch.length < BATCH_SIZE) { rankWhole = true; break; }
    }
  }

  if (!rankWhole) {
    const pRes = await buildFeedJobQuery(db, input, queryOpts)
      .order("published_at", { ascending: input.sortOrder === "oldest", nullsFirst: false })
      .order("updated_at", { ascending: false }).order("id", { ascending: true }).range(from, from + input.pageSize - 1);
    if (pRes.error) throw pRes.error;
    data = (pRes.data ?? []) as FeedJob[];
    count = pRes.count ?? count;
  }

  // Gradually enrich only the current discovery candidates. The queue enforces
  // a strict per-user active-task cap, so browsing cannot flood the AI worker.
  if (userId && profileVersion !== null && data.length) {
    const assessmentCandidates = rankWhole
      ? data.slice(from, from + Math.min(input.pageSize, 30))
      : data;
    try {
      await enqueueVisibleJobAssessments(
        userId,
        assessmentCandidates.map((job) => job.id),
        3,
      );
    } catch (error) {
      console.error("[job-feed-reader] Could not queue bounded assessments:", error);
    }
  }

  const currentHashes = new Map(data.map((job) => [
    job.id,
    createHash("sha256").update(job.description ?? "").digest("hex"),
  ]));
  const stateByJob = new Map(states.map((s) => [s.job_id, s.state]));
  const { assessmentsByJob, queueStatusByJob, hasError: hasAssessmentError } = userId && profileVersion !== null && data.length
    ? await fetchFeedAssessmentsAndQueue(db, userId, profileVersion, data.map((j) => j.id), currentHashes)
    : { assessmentsByJob: new Map(), queueStatusByJob: new Map(), hasError: false };

  let jobs: FeedJob[] = data.map((job) => {
    const currentHash = currentHashes.get(job.id)!;
    const statusResult = resolveJobMatchStatus({
      hasError: hasProfileError || hasAssessmentError, profileConfirmed: profileVersion !== null,
      currentHash, assessment: assessmentsByJob.get(job.id), queueStatus: queueStatusByJob.get(job.id),
    });
    return { ...job, state: stateByJob.get(job.id) ?? null, matchStatus: statusResult.matchStatus, ...(statusResult.matchClassification ? { matchClassification: statusResult.matchClassification } : {}) };
  });

  if (rankWhole) { jobs.sort(relevanceOrder); jobs = jobs.slice(from, from + input.pageSize); }

  // Assessment enrichment is bounded to three active tasks per user; persisted
  // results are read above so badges reflect only completed current-version work.

  const safeJobs = jobs.map((job) => {
    const safe = { ...job };
    delete safe.extracted_requirements; delete safe.requirements_description_hash;
    delete safe.requirements_extraction_version; delete safe.requirements_extraction_status;
    return safe;
  });
  return { jobs: safeJobs, page: input.page, pageSize: input.pageSize, total: count, totalPages: Math.ceil(count / input.pageSize) };
}
