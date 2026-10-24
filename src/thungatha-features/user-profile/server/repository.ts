import "server-only";

import { createAuthenticatedSupabaseClient } from "@/lib/supabase/server";
import {
  mapInputToRow,
  type ProfileDatabaseRow,
} from "./user-profile-mapper";
import type { UpdateProfileInput } from "./user-profile-schema";

export const PROFILE_SELECT_COLUMNS = [
  "user_id",
  "display_name",
  "full_name",
  "email",
  "phone",
  "location",
  "country",
  "linkedin_url",
  "portfolio_url",
  "summary",
  "experience",
  "education",
  "skills",
  "certifications",
  "projects",
  "master_cv",
  "confirmed_at",
  "profile_version",
  "created_at",
  "updated_at",
].join(", ");

export async function readProfile(
  userId: string,
  getToken: () => Promise<string | null>,
) {
  const supabase = await createAuthenticatedSupabaseClient(getToken);
  return supabase
    .from("profiles")
    .select(PROFILE_SELECT_COLUMNS)
    .eq("user_id", userId)
    .maybeSingle<ProfileDatabaseRow>();
}

export async function saveProfile(
  userId: string,
  input: UpdateProfileInput | string,
  getToken: () => Promise<string | null>,
) {
  const supabase = await createAuthenticatedSupabaseClient(getToken);
  const row = mapInputToRow(userId, input);
  return supabase
    .from("profiles")
    .upsert(row, { onConflict: "user_id" })
    .select(PROFILE_SELECT_COLUMNS)
    .single<ProfileDatabaseRow>();
}
