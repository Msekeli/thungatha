import "server-only";
import { createAuthenticatedSupabaseClient } from "@/lib/supabase/server";
import type { CvContent } from "./cv-studio-schema";

const TEMPLATE_VERSION = "ats-single-column-v1";
const DEFAULT_ACCENT = "teal";
const MASTER_CV_COLUMNS =
  "id, version_number, source_profile_version, content, template_version, accent_colour, updated_at";

type Database = Awaited<ReturnType<typeof createAuthenticatedSupabaseClient>>;

export async function getOrCreateMasterCv(
  supabase: Database,
  userId: string,
  profileVersion: number,
  content: CvContent,
) {
  const { data: existing, error: readError } = await supabase
    .from("cv_versions")
    .select(MASTER_CV_COLUMNS)
    .eq("user_id", userId)
    .eq("cv_kind", "master")
    .eq("status", "current")
    .maybeSingle();
  if (readError) throw readError;
  if (existing?.source_profile_version === profileVersion) return existing;

  if (existing) {
    const { error } = await supabase
      .from("cv_versions")
      .update({ status: "superseded", updated_at: new Date().toISOString() })
      .eq("id", existing.id)
      .eq("user_id", userId)
      .eq("status", "current");
    if (error) throw error;
  }

  const { data, error } = await supabase
    .from("cv_versions")
    .insert({
      user_id: userId,
      cv_kind: "master",
      status: "current",
      source_profile_version: profileVersion,
      content,
      suggestions: [],
      template_version: TEMPLATE_VERSION,
      accent_colour: existing?.accent_colour ?? DEFAULT_ACCENT,
    })
    .select(MASTER_CV_COLUMNS)
    .single();
  if (!error) return data;

  if (error.code === "23505") {
    const retry = await supabase
      .from("cv_versions")
      .select(MASTER_CV_COLUMNS)
      .eq("user_id", userId)
      .eq("cv_kind", "master")
      .eq("status", "current")
      .maybeSingle();
    if (!retry.error && retry.data?.source_profile_version === profileVersion) {
      return retry.data;
    }
  }
  throw error;
}
