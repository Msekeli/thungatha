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
  "residential_suburb",
  "residential_city",
  "residential_province",
  "residential_postal_code",
  "linkedin_url",
  "portfolio_url",
  "summary",
  "experience",
  "education",
  "skills",
  "certifications",
  "projects",
  "languages",
  "personal_attributes",
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
  const { user_id: ownerId, ...patch } = row;
  const updated = await supabase
    .from("profiles")
    .update(patch)
    .eq("user_id", ownerId)
    .select(PROFILE_SELECT_COLUMNS)
    .maybeSingle<ProfileDatabaseRow>();

  if (updated.error || updated.data) return updated;

  const inserted = await supabase
    .from("profiles")
    .insert(row)
    .select(PROFILE_SELECT_COLUMNS)
    .single<ProfileDatabaseRow>();

  if (!inserted.error || inserted.error.code !== "23505") return inserted;

  return supabase
    .from("profiles")
    .update(patch)
    .eq("user_id", ownerId)
    .select(PROFILE_SELECT_COLUMNS)
    .single<ProfileDatabaseRow>();
}
