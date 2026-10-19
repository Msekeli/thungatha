"use client";

import { useEffect, useState } from "react";
import { useClerk } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { SignOutConfirmationDialog } from "./sign-out-confirmation-dialog";
import "./sign-out-control.css";

export function SignOutControl() {
  const { signOut } = useClerk();
  const [isOpen, setIsOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || isSigningOut) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeDialog();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSigningOut]);

  function closeDialog() {
    setIsOpen(false);
    setError(null);
  }

  async function handleSignOut() {
    setIsSigningOut(true);
    setError(null);
    try {
      await signOut({ redirectUrl: `${window.location.origin}/` });
      window.location.replace("/");
    } catch (reason) {
      console.error("Failed to sign out:", reason);
      setError("We couldn't sign you out. Please try again.");
      setIsSigningOut(false);
    }
  }

  return (
    <>
      <Button variant="secondary" size="md" onClick={() => { setError(null); setIsOpen(true); }}>
        Sign out
      </Button>
      {isOpen ? <SignOutConfirmationDialog isSigningOut={isSigningOut} error={error}
        onClose={closeDialog} onConfirm={handleSignOut} /> : null}
    </>
  );
}
