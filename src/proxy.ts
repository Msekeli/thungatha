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
    await auth.protect();
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
    "/api/profile",
    "/api/jobs/:path*",
  ],
};
