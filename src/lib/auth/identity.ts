import "server-only";

import { auth } from "@clerk/nextjs/server";

export async function getAuthenticatedIdentity() {
  const session = await auth();
  if (!session.userId) return null;

  return {
    userId: session.userId,
    getToken: session.getToken,
  };
}

export function hasClerkConfiguration() {
  return Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
    process.env.CLERK_SECRET_KEY,
  );
}
