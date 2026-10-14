"use client";

import { SignOutButton } from "@clerk/nextjs";

export function SignOutControl() {
  return (
    <SignOutButton redirectUrl="/">
      <button className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700">
        Sign out
      </button>
    </SignOutButton>
  );
}
