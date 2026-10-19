"use client";

import { useEffect, useState } from "react";
import { useClerk } from "@clerk/nextjs";
import { LogOut, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import "./sign-out-control.css";

export function SignOutControl() {
  const { signOut } = useClerk();
  const [isOpen, setIsOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || isSigningOut) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        setError(null);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSigningOut]);

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
      <Button
        variant="secondary"
        size="md"
        onClick={() => {
          setError(null);
          setIsOpen(true);
        }}
      >
        Sign out
      </Button>

      {isOpen ? (
        <div
          className="th-signout-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isSigningOut) {
              setIsOpen(false);
              setError(null);
            }
          }}
        >
          <section
            className="th-signout-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="th-signout-title"
            aria-describedby="th-signout-description"
          >
            <button
              className="th-signout-close"
              type="button"
              aria-label="Close sign-out confirmation"
              disabled={isSigningOut}
              onClick={() => {
                setIsOpen(false);
                setError(null);
              }}
            >
              <X size={18} />
            </button>

            <span className="th-signout-icon" aria-hidden="true">
              <LogOut size={22} />
            </span>
            <h2 id="th-signout-title">Sign out of Thungatha?</h2>
            <p id="th-signout-description">
              You’ll be signed out of your account on this device. You can sign
              back in at any time.
            </p>

            {error ? (
              <p className="th-signout-error" role="alert">
                <ShieldCheck size={16} />
                {error}
              </p>
            ) : null}

            <div className="th-signout-actions">
              <Button
                variant="secondary"
                size="md"
                autoFocus
                disabled={isSigningOut}
                onClick={() => {
                  setIsOpen(false);
                  setError(null);
                }}
              >
                Stay signed in
              </Button>
              <Button
                variant="primary"
                size="md"
                disabled={isSigningOut}
                onClick={handleSignOut}
              >
                {isSigningOut ? "Signing out…" : "Yes, sign out"}
              </Button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
