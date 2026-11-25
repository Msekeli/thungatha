import "server-only";
import { createAuthenticatedSupabaseClient } from "@/lib/supabase/server";

type Database = Awaited<ReturnType<typeof createAuthenticatedSupabaseClient>>;

export async function findReusableCvDraft(
  db: Database,
  userId: string,
  profileVersion: number,
  matchFilter: string,
) {
  const { data, error } = await db
    .from("cv_versions")
    .select(
      "id,version_number,status,content,suggestions,tailoring_assessment,accent_colour,source_job_snapshot,source_job_id,source_profile_version,parent_version_id",
    )
    .eq("user_id", userId)
    .eq("cv_kind", "tailored")
    .eq("status", "draft")
    .eq("source_profile_version", profileVersion)
    .or(matchFilter)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}
