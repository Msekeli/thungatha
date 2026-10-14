"use client";

import { SignOutButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export function SignOutControl() {
  return (
    <SignOutButton redirectUrl="/">
      <Button variant="secondary" size="md">
        Sign out
      </Button>
    </SignOutButton>
  );
}
