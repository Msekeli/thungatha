"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Bookmark, ChartNoAxesColumn, ClipboardList } from "lucide-react";
import { PublicDiscoveryFeatureCard } from "./public-discovery-feature-card";

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

export function PublicJobDiscoveryPromoSidebar({
  configured,
}: {
  configured: boolean;
}) {
  return (
    <Stack
      component="aside"
      spacing={1.5}
      aria-label="Thungatha features"
      sx={{ minWidth: 0, minHeight: 0, overflowY: "auto" }}
    >
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Make more of your job search
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Find opportunities and use Thungatha tools to move forward with
          confidence.
        </Typography>
      </Box>
      {features.map((feature) => (
        <PublicDiscoveryFeatureCard
          key={feature.title}
          configured={configured}
          {...feature}
        />
      ))}
    </Stack>
  );
}
