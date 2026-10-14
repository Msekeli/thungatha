"use client";

import { ClerkProvider } from "@clerk/nextjs";
import type { ReactNode } from "react";
import { clerkAppearance } from "@/theme/clerk-appearance";

export function AuthProviders({
  children,
  configured,
}: {
  children: ReactNode;
  configured: boolean;
}) {
  return configured ? (
    <ClerkProvider
      appearance={clerkAppearance}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
    >
      {children}
    </ClerkProvider>
  ) : (
    children
  );
}
