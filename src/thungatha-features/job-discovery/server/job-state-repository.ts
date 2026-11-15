import type { SupabaseClient } from "@supabase/supabase-js";

export type UserJobState = {
  job_id: string;
  state: "saved" | "dismissed";
};

export async function readUserJobStates(
  db: SupabaseClient,
  userId: string,
  state: "all" | "saved" | "dismissed",
): Promise<UserJobState[]> {
  let query = db
    .from("user_job_states")
    .select("job_id,state")
    .eq("user_id", userId);
  if (state !== "all") query = query.eq("state", state);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}
