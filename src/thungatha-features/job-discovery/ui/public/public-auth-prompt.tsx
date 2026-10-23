"use client";

import { useId, useState, type ReactNode } from "react";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { X } from "lucide-react";
import { AnchoredPopover } from "@/components/ui/anchored-popover";
import { Button, ButtonLink } from "@/components/ui/button";

type Props = {
  configured: boolean;
  children: ReactNode;
  title?: string;
  description?: string;
};

export function PublicAuthPrompt({
  configured,
  children,
  title = "Make this job search yours",
  description = "Sign in or create a free account to use this feature and keep your job search organised.",
}: Props) {
  const [anchorEl, setAnchorEl] = useState<HTMLSpanElement | null>(null);
  const promptId = useId();
  const closePrompt = () => setAnchorEl(null);
  return (
    <>
      <span
        className="inline-flex"
        onClick={(event) =>
          setAnchorEl((current) =>
            current === event.currentTarget ? null : event.currentTarget,
          )
        }
      >
        {children}
      </span>
      <AnchoredPopover
        open={Boolean(anchorEl)}
        anchor={anchorEl}
        onClose={closePrompt}
        label={title}
        className="relative w-[min(340px,calc(100vw-24px))] rounded-lg border border-line bg-panel p-4 pr-12 text-fg shadow-xl"
      >
        <Button
          variant="ghost"
          size="icon-sm"
          className="absolute right-2 top-2"
          aria-label="Close message"
          onClick={closePrompt}
        >
          <X size={16} />
        </Button>
        <h2 id={`${promptId}-title`} className="m-0 text-base font-bold">
          {title}
        </h2>
        <p
          id={`${promptId}-description`}
          className="mb-0 mt-2 text-sm text-fg-muted"
        >
          {description}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {configured ? (
            <>
              <SignInButton mode="modal" fallbackRedirectUrl="/?welcome=1">
                <Button size="sm" variant="outline" onClick={closePrompt}>
                  Sign in
                </Button>
              </SignInButton>
              <SignUpButton mode="modal" fallbackRedirectUrl="/?welcome=1">
                <Button size="sm" variant="primary" onClick={closePrompt}>
                  Create free account
                </Button>
              </SignUpButton>
            </>
          ) : (
            <>
              <ButtonLink href="/sign-in" size="sm" variant="outline">
                Sign in
              </ButtonLink>
              <ButtonLink href="/sign-up" size="sm" variant="primary">
                Create free account
              </ButtonLink>
            </>
          )}
        </div>
      </AnchoredPopover>
    </>
  );
}
