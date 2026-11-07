import { connection, NextResponse } from "next/server";
import {
  getAuthenticatedIdentity,
  hasClerkConfiguration,
} from "@/thungatha-features/authentication/server/identity";
import { apiError } from "@/lib/http/api-response";

export type JobDiscoveryUser = NonNullable<
  Awaited<ReturnType<typeof getAuthenticatedIdentity>>
>;

export async function resolveJobDiscoveryUser(): Promise<{
  user: JobDiscoveryUser | null;
  response: NextResponse | null;
}> {
  await connection();
  if (!hasClerkConfiguration()) {
    return {
      user: null,
      response: apiError("Authentication is not configured", 503),
    };
  }

  try {
    const user = await getAuthenticatedIdentity();
    if (!user) {
      return {
        user: null,
        response: apiError("Authentication required", 401),
      };
    }
    return { user, response: null };
  } catch {
    return {
      user: null,
      response: apiError("Authentication could not be verified", 503),
    };
  }
}
