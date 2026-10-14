"use client";

import { ClerkProvider } from "@clerk/nextjs";
import type { ReactNode } from "react";

export function AuthProviders({
  children,
  configured,
}: {
  children: ReactNode;
  configured: boolean;
}) {
  return configured ? <ClerkProvider>{children}</ClerkProvider> : children;
}
