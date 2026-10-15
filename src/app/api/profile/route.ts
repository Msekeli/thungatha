import { NextResponse } from "next/server";
import {
  getAuthenticatedIdentity,
  hasClerkConfiguration,
} from "@/lib/auth/identity";
import { apiError, apiFailure } from "@/lib/http/api-response";
import { readProfile, saveProfile } from "@/lib/profile/repository";
import { updateProfileSchema } from "@/lib/profile/schema";
import { SupabaseConfigurationError } from "@/lib/supabase/server";

async function resolveIdentity() {
  try {
    return {
      identity: await getAuthenticatedIdentity(),
      response: null,
    };
  } catch (error) {
    console.error("Authentication identity resolution failed:", {
      errorName: error instanceof Error ? error.name : "unknown",
    });

    return {
      identity: null,
      response: apiError("Authentication could not be verified", 503),
    };
  }
}

export async function GET() {
  if (!hasClerkConfiguration()) {
    return apiError("Authentication is not configured", 503);
  }

  const { identity, response } = await resolveIdentity();

  if (response) return response;
  if (!identity) return apiError("Authentication required", 401);

  try {
    const { data, error } = await readProfile(
      identity.userId,
      identity.getToken,
    );

    if (error) throw error;

    return NextResponse.json({
      profile: {
        displayName: data?.display_name ?? null,
      },
    });
  } catch (error) {
    if (error instanceof SupabaseConfigurationError) {
      return apiError("Profile storage is not configured", 503);
    }

    return apiFailure(error);
  }
}

export async function PATCH(request: Request) {
  if (!hasClerkConfiguration()) {
    return apiError("Authentication is not configured", 503);
  }

  const { identity, response } = await resolveIdentity();

  if (response) return response;
  if (!identity) return apiError("Authentication required", 401);

  let body: unknown;

  try {
    body = await request.json();
  } catch (error) {
    return apiFailure(error);
  }

  const parsed = updateProfileSchema.safeParse(body);

  if (!parsed.success) {
    return apiError("A valid display name is required", 400);
  }

  try {
    const { data, error } = await saveProfile(
      identity.userId,
      parsed.data.displayName,
      identity.getToken,
    );

    if (error) throw error;

    return NextResponse.json({
      profile: {
        displayName: data.display_name,
      },
    });
  } catch (error) {
    if (error instanceof SupabaseConfigurationError) {
      return apiError("Profile storage is not configured", 503);
    }

    return apiFailure(error);
  }
}
