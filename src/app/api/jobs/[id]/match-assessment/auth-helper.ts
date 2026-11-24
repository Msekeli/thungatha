import { apiError } from "@/lib/http/api-response";
import {
  getAuthenticatedIdentity,
  hasClerkConfiguration,
} from "@/thungatha-features/authentication/server/identity";

export async function requireAuthIdentity() {
  if (!hasClerkConfiguration())
    return {
      errorResponse: apiError("Authentication required", 401),
      identity: null,
    };
  try {
    const identity = await getAuthenticatedIdentity();
    if (!identity)
      return {
        errorResponse: apiError("Authentication required", 401),
        identity: null,
      };
    return { errorResponse: null, identity };
  } catch {
    return {
      errorResponse: apiError("Authentication could not be verified", 503),
      identity: null,
    };
  }
}
