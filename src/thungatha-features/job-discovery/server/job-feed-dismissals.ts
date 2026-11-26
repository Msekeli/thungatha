import type { SupabaseClient } from "@supabase/supabase-js";

export async function readEmployerDismissals(
  db: SupabaseClient,
  userId: string | null,
) {
  let dismissals: Array<{ employer_key: string; employer_name: string }> = [];
  let dismissalsAvailable = false;
  if (userId) {
    const res = await db
      .from("user_employer_dismissals")
      .select("employer_key,employer_name")
      .eq("user_id", userId);
    if (!res.error) {
      dismissals = res.data ?? [];
      dismissalsAvailable = true;
    } else if (
      !["42P01", "42703", "PGRST204", "PGRST205"].includes(res.error.code ?? "")
    )
      throw res.error;
  }
  return { dismissals, dismissalsAvailable };
}
