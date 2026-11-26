import type { SupabaseClient } from "@supabase/supabase-js";
import type { FeedJob } from "./job-feed-sorting";
import { createJobMatchingContext, hashJobContext } from "./job-ai-queue-eligibility";
import { relevanceOrder } from "./job-feed-sorting";
import { fetchFeedAssessmentsAndQueue } from "./job-feed-assessments";
import { resolveJobMatchStatus } from "./job-feed-status";

export async function buildJobFeedResponseRows(input: {
  db: SupabaseClient;
  userId: string | null;
  profileVersion: number | null;
  data: FeedJob[];
  states: Array<{ job_id: string; state: string }>;
  hasProfileError: boolean;
  rankWhole: boolean;
  from: number;
  pageSize: number;
}) {
  const {
    db, userId, profileVersion, data, states, hasProfileError,
    rankWhole, from, pageSize,
  } = input;
  const currentHashes = new Map(
    data.map((job) => [job.id, hashJobContext(createJobMatchingContext(job))]),
  );
  const stateByJob = new Map(states.map((s) => [s.job_id, s.state]));
  const {
    assessmentsByJob,
    queueStatusByJob,
    hasError: hasAssessmentError,
  } = userId && profileVersion !== null && data.length
    ? await fetchFeedAssessmentsAndQueue(
        db,
        userId,
        profileVersion,
        data.map((j) => j.id),
        currentHashes,
      )
    : {
        assessmentsByJob: new Map(),
        queueStatusByJob: new Map(),
        hasError: false,
      };

  let jobs: FeedJob[] = data.map((job) => {
    const currentHash = currentHashes.get(job.id)!;
    const statusResult = resolveJobMatchStatus({
      hasError: hasProfileError || hasAssessmentError,
      profileConfirmed: profileVersion !== null,
      currentHash,
      assessment: assessmentsByJob.get(job.id),
      queueStatus: queueStatusByJob.get(job.id),
    });
    return {
      ...job,
      state: stateByJob.get(job.id) ?? null,
      matchStatus: statusResult.matchStatus,
      ...(statusResult.matchClassification
        ? { matchClassification: statusResult.matchClassification }
        : {}),
    };
  });

  if (rankWhole) {
    jobs.sort(relevanceOrder);
    jobs = jobs.slice(from, from + input.pageSize);
  }

  // Persisted results are read above so badges reflect only completed current-version work.

  const safeJobs = jobs.map((job) => {
    const safe = { ...job };
    delete safe.extracted_requirements;
    delete safe.requirements_description_hash;
    delete safe.requirements_extraction_version;
    delete safe.requirements_extraction_status;
    return safe;
  });
  return safeJobs;
}
