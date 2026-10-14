"use client";

import { Show, SignInButton, SignUpButton } from "@clerk/nextjs";
import Link from "next/link";

const buttonClass =
  "rounded-full px-6 py-3 font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-teal";

export function HomeAuthActions({ configured }: { configured: boolean }) {
  if (!configured) {
    return (
      <p className="max-w-lg rounded-xl border border-white/15 bg-white/5 px-5 py-4 text-sm leading-6 text-slate-300">
        Sign in will be available after Clerk is configured. Copy the required
        values from <code>.env.example</code> into your local environment.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Show when="signed-out">
        <SignUpButton mode="modal">
          <button
            className={`${buttonClass} bg-brand-teal text-slate-950 hover:brightness-95`}
          >
            Create your account
          </button>
        </SignUpButton>
        <SignInButton mode="modal">
          <button
            className={`${buttonClass} border border-white/25 text-white hover:bg-white/10`}
          >
            Sign in
          </button>
        </SignInButton>
      </Show>
      <Show when="signed-in">
        <Link
          href="/dashboard"
          className={`${buttonClass} bg-brand-teal text-slate-950 hover:brightness-95`}
        >
          Open your workspace
        </Link>
      </Show>
    </div>
  );
}
