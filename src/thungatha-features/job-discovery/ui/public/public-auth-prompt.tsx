"use client";

import { useId, useState, type ReactNode } from "react";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import {
  Button,
  ClickAwayListener,
  IconButton,
  Paper,
  Popper,
  Typography,
} from "@mui/material";
import { X } from "lucide-react";
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
  const [anchorEl, setAnchorEl] = useState<HTMLSpanElement | null>(null);
  const promptId = useId();
  const open = Boolean(anchorEl);

  function closePrompt() {
    setAnchorEl(null);
  }

  return (
    <>
      <span
        onClick={(event) =>
          setAnchorEl((current) =>
            current === event.currentTarget ? null : event.currentTarget,
          )
        }
        style={{ display: "inline-flex" }}
      >
        {children}
      </span>
      <Popper
        open={open}
        anchorEl={anchorEl}
        placement="bottom-start"
        sx={{
          zIndex: 1500,
          maxWidth: "calc(100vw - 24px)",
        }}
        modifiers={[{ name: "offset", options: { offset: [0, 8] } }]}
      >
        <ClickAwayListener
          onClickAway={(event) => {
            if (anchorEl?.contains(event.target as Node)) return;
            closePrompt();
          }}
        >
          <Paper
            role="region"
            aria-labelledby={`${promptId}-title`}
            aria-describedby={`${promptId}-description`}
            elevation={8}
            sx={{
              position: "relative",
              width: "min(340px, calc(100vw - 24px))",
              p: 2,
              pr: 5,
              color: "text.primary",
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              boxShadow: "0 12px 32px rgba(0,0,0,.18)",
            }}
          >
            <IconButton
              aria-label="Close message"
              size="small"
              onClick={closePrompt}
              sx={{ position: "absolute", top: 8, right: 8 }}
            >
              <X size={16} />
            </IconButton>
            <Typography id={`${promptId}-title`} variant="subtitle1" fontWeight={700}>
              {title}
            </Typography>
            <Typography
              id={`${promptId}-description`}
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5 }}
            >
              {description}
            </Typography>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16 }}>
              {configured ? (
                <>
                  <SignInButton mode="modal" fallbackRedirectUrl="/?welcome=1">
                    <Button size="small" variant="outlined" onClick={closePrompt}>
                      Sign in
                    </Button>
                  </SignInButton>
                  <SignUpButton mode="modal" fallbackRedirectUrl="/?welcome=1">
                    <Button size="small" variant="contained" onClick={closePrompt}>
                      Create free account
                    </Button>
                  </SignUpButton>
                </>
              ) : (
                <>
                  <Button component={Link} href="/sign-in" size="small" variant="outlined">
                    Sign in
                  </Button>
                  <Button component={Link} href="/sign-up" size="small" variant="contained">
                    Create free account
                  </Button>
                </>
              )}
            </div>
          </Paper>
        </ClickAwayListener>
      </Popper>
    </>
  );
}
