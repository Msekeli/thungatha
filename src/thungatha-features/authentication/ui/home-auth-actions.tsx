"use client";

import { Show, SignInButton, SignUpButton } from "@clerk/nextjs";
import { Button, ButtonLink } from "@/components/ui/button";
import { SignOutControl } from "@/thungatha-features/authentication/ui/sign-out-control";

type Variant = "nav" | "hero" | "cta";

export function HomeAuthActions({
  configured,
  variant = "hero",
}: {
  configured: boolean;
  variant?: Variant;
}) {
  const size = variant === "nav" ? "sm" : "lg";
  const signUpLabel = variant === "nav" ? "Sign up" : "Create your account";
  const signInVariant = variant === "nav" ? "ghost" : "secondary";

  if (!configured) {
    return (
      <div
        className={
          variant === "nav" ? "flex items-center gap-1" : "flex flex-col gap-3"
        }
      >
        <div
          className={
            variant === "nav"
              ? "flex flex-nowrap items-center gap-1"
              : "flex flex-wrap gap-2"
          }
        >
          <ButtonLink href="/sign-up" variant="primary" size={size} className={variant === "nav" ? "h-9 rounded-md bg-public-action-bg px-4 text-xs font-semibold text-public-action-fg shadow-none" : ""}>
            {signUpLabel}
          </ButtonLink>
          <ButtonLink href="/sign-in" variant={signInVariant} size={size} className={variant === "nav" ? "h-9 rounded-md border border-[var(--th-accent-on-navy)] px-3 text-xs font-semibold text-[var(--th-accent-on-navy)] hover:bg-[var(--th-nav-active-bg)] hover:text-[var(--th-accent-on-navy)]" : ""}>
            Sign in
          </ButtonLink>
        </div>

        {variant === "hero" ? (
          <p className="max-w-lg rounded-panel border border-line bg-panel px-5 py-4 text-detail text-fg-muted">
            Sign in will be available after Clerk is configured. Copy the
            required values from <code>.env.example</code> into your local
            environment.
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div
      className={`flex items-center ${variant === "nav" ? "flex-nowrap gap-1" : "flex-wrap gap-2"}`}
    >
      <Show when="signed-out">
        <SignUpButton mode="modal">
          <Button variant="primary" size={size} className={variant === "nav" ? "h-9 rounded-md bg-public-action-bg px-4 text-public-action-fg shadow-none" : ""}>
            {signUpLabel}
          </Button>
        </SignUpButton>
        <SignInButton mode="modal">
          <Button variant={signInVariant} size={size} className={variant === "nav" ? "h-9 rounded-md border border-[var(--th-accent-on-navy)] px-3 text-[var(--th-accent-on-navy)] hover:bg-[var(--th-nav-active-bg)] hover:text-[var(--th-accent-on-navy)]" : ""}>
            Sign in
          </Button>
        </SignInButton>
      </Show>

      <Show when="signed-in">
        <ButtonLink href="/jobs" variant="primary" size={size}>
          Browse jobs
        </ButtonLink>
        {variant === "nav" ? <SignOutControl /> : null}
      </Show>
    </div>
  );
}
