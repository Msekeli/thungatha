import "server-only";

import { apiError } from "@/lib/http/api-response";
import {
  getAuthenticatedIdentity,
  hasClerkConfiguration,
} from "@/thungatha-features/authentication/server/identity";

export async function resolveProfileIdentity() {
  if (!hasClerkConfiguration()) {
    return {
      identity: null,
      response: apiError("Authentication is not configured", 503),
    };
  }

  try {
    const identity = await getAuthenticatedIdentity();
    if (!identity) {
      return {
        identity: null,
        response: apiError("Authentication required", 401),
      };
    }
    return { identity, response: null };
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
