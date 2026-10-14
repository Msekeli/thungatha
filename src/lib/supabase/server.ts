import "server-only";

import { createClient } from "@supabase/supabase-js";

export class SupabaseConfigurationError extends Error {
  constructor() {
    super("Supabase server configuration is missing");
    this.name = "SupabaseConfigurationError";
  }
}

export async function createAuthenticatedSupabaseClient(
  getToken: () => Promise<string | null>,
) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !publishableKey) throw new SupabaseConfigurationError();

  return createClient(url, publishableKey, {
    accessToken: getToken,
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
}
