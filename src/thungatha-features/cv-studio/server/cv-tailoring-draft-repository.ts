import "server-only";
import { createAuthenticatedSupabaseClient } from "@/lib/supabase/server";

export type CvTailoringDatabase = Awaited<
  ReturnType<typeof createAuthenticatedSupabaseClient>
>;

export async function readCvTailoringDraft(
  db: CvTailoringDatabase,
  userId: string,
  draftId: string,
) {
  const { data, error } = await db
    .from("cv_versions")
    .select(
      "id,status,content,suggestions,tailoring_assessment,cv_kind,source_profile_version,parent_version_id,source_job_snapshot,source_job_id",
    )
    .eq("id", draftId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function readCvTailoringMaster(
  db: CvTailoringDatabase,
  userId: string,
  masterId: string,
) {
  const { data, error } = await db
    .from("cv_versions")
    .select("id,content,cv_kind,status,source_profile_version")
    .eq("id", masterId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export type CvTailoringDraft = NonNullable<
  Awaited<ReturnType<typeof readCvTailoringDraft>>
>;
