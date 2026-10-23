"use client";

import { Bookmark, ChartNoAxesColumn, ClipboardList } from "lucide-react";
import { PublicDiscoveryFeatureCard } from "./public-discovery-feature-card";

const features = [
  {
    title: "CV matching",
    description:
      "Build your profile so we can match opportunities to your skills and experience.",
    note: "Personalised recommendations",
    icon: ClipboardList,
    iconClass: "text-secondary",
    action: "Create your profile",
  },
  {
    title: "Saved Jobs",
    description:
      "Keep interesting opportunities together and return to them when you are ready.",
    note: "Build your shortlist",
    icon: Bookmark,
    iconClass: "text-accent",
    action: "Sign in to save jobs",
  },
  {
    title: "Track Applications",
    description:
      "Keep application status, follow-ups and next steps organised in one place.",
    note: "Stay on top of progress",
    icon: ChartNoAxesColumn,
    iconClass: "text-success",
    action: "Sign in to track",
  },
];

export function PublicJobDiscoveryPromoSidebar({
  configured,
}: {
  configured: boolean;
}) {
  return (
    <aside
      aria-label="Thungatha features"
      className="flex min-h-0 min-w-0 flex-col gap-3 overflow-y-auto"
    >
      <div>
        <h2 className="text-base font-bold leading-snug">
          Make more of your job search
        </h2>
        <p className="mt-1 text-sm text-muted">
          Find opportunities and use Thungatha tools to move forward with
          confidence.
        </p>
      </div>
      {features.map((feature) => (
        <PublicDiscoveryFeatureCard
          key={feature.title}
          configured={configured}
          {...feature}
        />
      ))}
    </aside>
  );
}
