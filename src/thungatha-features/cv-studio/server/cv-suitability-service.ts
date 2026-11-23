import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { CvJobContext } from "./job-context-schema";

type AcceptedVersionRow = {
  id: string;
  version_number: number;
  updated_at: string;
  accent_colour: "teal" | "navy" | "burgundy" | "forest";
  source_job_id: string | null;
  source_job_snapshot: { descriptionFingerprint?: string } | null;
};

export async function findMatchingAcceptedVersions(
  db: SupabaseClient,
  userId: string,
  profileVersion: number,
  job: CvJobContext,
) {
  const { data, error } = await db.from("cv_versions")
    .select("id,version_number,updated_at,accent_colour,source_job_id,source_job_snapshot")
    .eq("user_id", userId)
    .eq("cv_kind", "tailored")
    .eq("status", "accepted")
    .eq("source_profile_version", profileVersion)
    .order("updated_at", { ascending: false });
  if (error) throw error;

  const rows = (data ?? []) as AcceptedVersionRow[];
  return rows.filter((row) => job.jobId
    ? row.source_job_id === job.jobId
    : row.source_job_snapshot?.descriptionFingerprint === job.descriptionFingerprint
  ).map((row) => ({
    id: row.id,
    versionNumber: Number(row.version_number),
    updatedAt: row.updated_at,
    accentColour: row.accent_colour,
  }));
}
