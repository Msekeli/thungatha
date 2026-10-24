import { NextResponse } from "next/server";
import { apiError, apiFailure } from "@/lib/http/api-response";
import { SupabaseConfigurationError } from "@/lib/supabase/server";
import { resolveProfileIdentity } from "@/thungatha-features/user-profile/server/profile-route-auth";
import {
  readProfile,
  saveProfile,
} from "@/thungatha-features/user-profile/server/repository";
import { mapRowToProfileDto } from "@/thungatha-features/user-profile/server/user-profile-mapper";
import { updateProfileSchema } from "@/thungatha-features/user-profile/server/user-profile-schema";

export async function GET() {
  const { identity, response } = await resolveProfileIdentity();
  if (response || !identity) return response;

  try {
    const { data, error } = await readProfile(
      identity.userId,
      identity.getToken,
    );
    if (error) throw error;

    return NextResponse.json({ profile: mapRowToProfileDto(data) });
  } catch (error) {
    if (error instanceof SupabaseConfigurationError) {
      return apiError("Profile storage is not configured", 503);
    }
    return apiFailure(error);
  }
}

export async function PATCH(request: Request) {
  const { identity, response } = await resolveProfileIdentity();
  if (response || !identity) return response;

  let body: unknown;
  try {
    body = await request.json();
  } catch (error) {
    return apiFailure(error);
  }

  const parsed = updateProfileSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(
      parsed.error.issues[0]?.message || "A valid profile is required",
      400,
    );
  }

  try {
    const { data, error } = await saveProfile(
      identity.userId,
      parsed.data,
      identity.getToken,
    );
    if (error) throw error;

    return NextResponse.json({ profile: mapRowToProfileDto(data) });
  } catch (error) {
    if (error instanceof SupabaseConfigurationError) {
      return apiError("Profile storage is not configured", 503);
    }
    return apiFailure(error);
  }
}
