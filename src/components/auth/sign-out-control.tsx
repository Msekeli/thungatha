"use client";

import { useState } from "react";
import { useClerk } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export function SignOutControl() {
  const { signOut } = useClerk();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    const confirmed = window.confirm("Are you sure you want to sign out?");

    if (!confirmed) {
      return;
    }

    setIsSigningOut(true);

    try {
      await signOut({ redirectUrl: "/" });
    } catch (error) {
      console.error("Failed to sign out:", error);
      setIsSigningOut(false);
    }
  }

  return (
    <Button
      variant="secondary"
      size="md"
      onClick={handleSignOut}
      disabled={isSigningOut}
    >
      {isSigningOut ? "Signing out..." : "Sign out"}
    </Button>
  );
}
