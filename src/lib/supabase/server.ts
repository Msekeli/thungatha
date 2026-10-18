import "server-only";

import { createClient } from "@supabase/supabase-js";

export class SupabaseConfigurationError extends Error {
  constructor() {
    super("Supabase server configuration is missing");
    this.name = "SupabaseConfigurationError";
  }
}

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !publishableKey) throw new SupabaseConfigurationError();
  return { url, publishableKey };
}

export async function createAuthenticatedSupabaseClient(
  getToken: () => Promise<string | null>,
) {
  const { url, publishableKey } = getSupabaseConfig();
  return createClient(url, publishableKey, {
    accessToken: getToken,
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
}

/** Public reads use the publishable key and are constrained by anonymous RLS policies. */
export async function createPublicSupabaseClient() {
  const { url, publishableKey } = getSupabaseConfig();
  return createClient(url, publishableKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
}
