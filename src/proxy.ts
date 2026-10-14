import { clerkMiddleware } from "@clerk/nextjs/server";
import {
  NextResponse,
  type NextFetchEvent,
  type NextRequest,
} from "next/server";

const clerkHandler = clerkMiddleware(async (auth, request) => {
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    await auth.protect();
  }
});

export default function proxy(request: NextRequest, event: NextFetchEvent) {
  const path = request.nextUrl.pathname;
  const isProtectedPath = path.startsWith("/dashboard");
  const configured = Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
    process.env.CLERK_SECRET_KEY,
  );

  if (!configured) {
    if (isProtectedPath)
      return NextResponse.redirect(new URL("/?auth=setup", request.url));
    return NextResponse.next();
  }

  return clerkHandler(request, event);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/sign-in/:path*",
    "/sign-up/:path*",
    "/api/profile",
  ],
};
