import { clerkMiddleware } from "@clerk/nextjs/server";
import {
  NextResponse,
  type NextFetchEvent,
  type NextRequest,
} from "next/server";

const protectedPrefixes = [
  "/jobs",
  "/cv-studio",
  "/applications",
  "/profile",
  "/account",
];

function isProtectedPath(path: string) {
  return protectedPrefixes.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
}

const clerkHandler = clerkMiddleware(async (auth, request) => {
  if (isProtectedPath(request.nextUrl.pathname)) {
    const returnPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;

    // Clerk requires an absolute URL here. Build it from the incoming request
    // so localhost, preview, and production hosts all resolve correctly.
    const unauthenticatedUrl = new URL("/sign-in", request.url);
    unauthenticatedUrl.searchParams.set("redirect_url", returnPath);

    await auth.protect({
      unauthenticatedUrl: unauthenticatedUrl.toString(),
    });
  }
});

export default function proxy(request: NextRequest, event: NextFetchEvent) {
  const path = request.nextUrl.pathname;
  const configured = Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
    process.env.CLERK_SECRET_KEY,
  );

  if (configured === false) {
    if (isProtectedPath(path)) {
      return NextResponse.redirect(new URL("/?auth=setup", request.url));
    }
    return NextResponse.next();
  }

  return clerkHandler(request, event);
}

export const config = {
  matcher: [
    "/",
    "/jobs/:path*",
    "/cv-studio/:path*",
    "/applications/:path*",
    "/profile/:path*",
    "/account/:path*",
    "/sign-in/:path*",
    "/sign-up/:path*",
    "/api/profile/:path*",
    "/api/jobs/:path*",
  ],
};
