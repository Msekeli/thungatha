import "server-only";
import {
  JOB_AI_ASSESSMENT_VERSION,
  JOB_AI_UNDERSTANDING_VERSION,
  createServiceClient,
  getConfirmedProfileVersion,
  getJobAiTaskStatus,
  retryFailedJobAiTask,
  requeueCompletedJobAiTask,
  isUsableJobDescription,
} from "./job-ai-queue-eligibility";
import { enqueueJobRows } from "./job-ai-queue-enqueue";

export {
  JOB_AI_ASSESSMENT_VERSION,
  JOB_AI_UNDERSTANDING_VERSION,
  isUsableJobDescription,
  getJobAiTaskStatus,
  retryFailedJobAiTask,
  requeueCompletedJobAiTask,
};

const BACKFILL_BATCH_SIZE = 500;

export async function enqueueVisibleJobAssessments(
  userId: string,
  jobIds: string[],
) {
  const uniqueIds = [...new Set(jobIds)].filter(Boolean);
  if (!uniqueIds.length) return 0;
  const profileVersion = await getConfirmedProfileVersion(userId);
  if (profileVersion === null) return 0;

  const { data, error } = await createServiceClient()
    .from("jobs")
    .select("id,title,employer_name,location_text,description")
    .in("id", uniqueIds);
  if (error) throw error;
  return enqueueJobRows(userId, profileVersion, data ?? []);
}

/**
 * Queue imported Scout jobs for every user with a confirmed Profile.
 * Idempotency is enforced by the job context hash and database queue dedupe key.
 */
export async function enqueueImportedJobAssessments(jobIds: string[]) {
  const uniqueIds = [...new Set(jobIds)].filter(Boolean);
  if (!uniqueIds.length) return { users: 0, queued: 0, eligible: 0 };

  const db = createServiceClient();
  const [
    { data: profiles, error: profileError },
    { data: jobs, error: jobError },
  ] = await Promise.all([
    db
      .from("profiles")
      .select("user_id,profile_version")
      .not("confirmed_at", "is", null),
    db
      .from("jobs")
      .select("id,title,employer_name,location_text,description")
      .in("id", uniqueIds),
  ]);
  if (profileError) throw profileError;
  if (jobError) throw jobError;

  const eligible = (jobs ?? []).filter((job) =>
    isUsableJobDescription(job.description),
  ).length;
  let queued = 0;
  for (const profile of profiles ?? []) {
    queued += await enqueueJobRows(
      profile.user_id,
      profile.profile_version ?? 1,
      jobs ?? [],
    );
  }
  return { users: profiles?.length ?? 0, queued, eligible };
}

/** Backfill the complete catalogue in pages; database deduplication prevents duplicate work. */
export async function enqueueAllJobAssessments(userId: string) {
  const profileVersion = await getConfirmedProfileVersion(userId);
  if (profileVersion === null) return { queued: 0, eligible: 0 };

  const db = createServiceClient();
  let queued = 0;
  let eligible = 0;
  let offset = 0;
  while (true) {
    const { data, error } = await db
      .from("jobs")
      .select("id,title,employer_name,location_text,description")
      .order("id", { ascending: true })
      .range(offset, offset + BACKFILL_BATCH_SIZE - 1);
    if (error) throw error;
    const batch = data ?? [];
    if (!batch.length) break;
    eligible += batch.filter((job) =>
      isUsableJobDescription(job.description),
    ).length;
    queued += await enqueueJobRows(userId, profileVersion, batch);
    offset += batch.length;
    if (batch.length < BACKFILL_BATCH_SIZE) break;
  }
  return { queued, eligible };
}
