"use client";

import type { LucideIcon } from "lucide-react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { PublicAuthPrompt } from "./public-auth-prompt";

export function PublicDiscoveryFeatureCard({
  configured,
  title,
  description,
  note,
  icon: Icon,
  color,
  action,
}: {
  configured: boolean;
  title: string;
  description: string;
  note: string;
  icon: LucideIcon;
  color: string;
  action: string;
}) {
  return (
    <Card variant="outlined">
      <CardContent sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
        <Box sx={{ color, display: "flex", pt: 0.5 }}>
          <Icon size={21} aria-hidden="true" />
        </Box>
        <Stack spacing={0.75} sx={{ minWidth: 0 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {note}
          </Typography>
          <PublicAuthPrompt
            configured={configured}
            title={title}
            description={`Sign in or create a free account to access ${title.toLowerCase()} and keep your job search organised.`}
          >
            <Button variant="outlined" size="small">
              {action}
            </Button>
          </PublicAuthPrompt>
        </Stack>
      </CardContent>
    </Card>
  );
}
