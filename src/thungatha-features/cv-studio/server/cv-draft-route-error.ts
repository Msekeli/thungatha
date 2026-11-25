import { apiError, apiFailure } from "@/lib/http/api-response";
import { SupabaseConfigurationError } from "@/lib/supabase/server";

export function handleCvDraftRouteError(error: unknown) {
  if (error instanceof SupabaseConfigurationError) {
    return apiError("CV Studio storage is not configured.", 503);
  }
  return apiFailure(error);
}
