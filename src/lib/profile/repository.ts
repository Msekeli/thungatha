import "server-only";

import { createAuthenticatedSupabaseClient } from "@/lib/supabase/server";

export async function readProfile(
  userId: string,
  getToken: () => Promise<string | null>,
) {
  const supabase = await createAuthenticatedSupabaseClient(getToken);
  return supabase
    .from("profiles")
    .select("display_name")
    .eq("user_id", userId)
    .maybeSingle();
}

export async function saveProfile(
  userId: string,
  displayName: string,
  getToken: () => Promise<string | null>,
) {
  const supabase = await createAuthenticatedSupabaseClient(getToken);
  return supabase
    .from("profiles")
    .upsert(
      { user_id: userId, display_name: displayName },
      { onConflict: "user_id" },
    )
    .select("display_name")
    .single();
}
