"use client";

import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
} from "@mui/material";
import { Bookmark, ChartNoAxesColumn, ClipboardList } from "lucide-react";
import { PublicAuthPrompt } from "./public-auth-prompt";

const features = [
  {
    title: "CV matching",
    description:
      "Build your profile so we can match opportunities to your skills and experience.",
    note: "Personalised recommendations",
    icon: ClipboardList,
    color: "secondary.main",
    action: "Create your profile",
  },
  {
    title: "Saved Jobs",
    description:
      "Keep interesting opportunities together and return to them when you are ready.",
    note: "Build your shortlist",
    icon: Bookmark,
    color: "primary.main",
    action: "Sign in to save jobs",
  },
  {
    title: "Track Applications",
    description:
      "Keep application status, follow-ups and next steps organised in one place.",
    note: "Stay on top of progress",
    icon: ChartNoAxesColumn,
    color: "success.main",
    action: "Sign in to track",
  },
];

export function PublicJobDiscoverySidebar({
  configured,
}: {
  configured: boolean;
}) {
  return (
    <Stack component="aside" spacing={2} aria-label="Thungatha features">
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Make more of your job search
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Find opportunities and use Thungatha tools to move forward with
          confidence.
        </Typography>
      </Box>
      {features.map(
        ({ title, description, note, icon: Icon, color, action }) => (
          <Card key={title} variant="outlined">
            <CardContent
              sx={{
                display: "flex",
                gap: 1.5,
                alignItems: "flex-start",
                "&:last-child": { pb: 2 },
              }}
            >
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
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{ alignSelf: "flex-start" }}
                  >
                    {action}
                  </Button>
                </PublicAuthPrompt>
              </Stack>
            </CardContent>
          </Card>
        ),
      )}
    </Stack>
  );
}
