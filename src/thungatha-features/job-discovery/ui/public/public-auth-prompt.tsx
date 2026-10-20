"use client";

import { useId, useState, type ReactNode } from "react";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import Link from "next/link";

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
  const [open, setOpen] = useState(false);
  const promptId = useId();

  return (
    <>
      <span onClick={() => setOpen(true)} style={{ display: "inline-flex" }}>
        {children}
      </span>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby={`${promptId}-title`}
        aria-describedby={`${promptId}-description`}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle id={`${promptId}-title`}>{title}</DialogTitle>
        <DialogContent>
          <DialogContentText id={`${promptId}-description`}>
            {description}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1, flexWrap: "wrap" }}>
          {configured ? (
            <>
              <SignInButton mode="modal" fallbackRedirectUrl="/?welcome=1">
                <Button variant="outlined" onClick={() => setOpen(false)}>
                  Sign in
                </Button>
              </SignInButton>
              <SignUpButton mode="modal" fallbackRedirectUrl="/?welcome=1">
                <Button variant="contained" onClick={() => setOpen(false)}>
                  Create free account
                </Button>
              </SignUpButton>
            </>
          ) : (
            <>
              <Button component={Link} href="/sign-in" variant="outlined">
                Sign in
              </Button>
              <Button component={Link} href="/sign-up" variant="contained">
                Create free account
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
}
