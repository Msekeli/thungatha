"use client";

import { Bookmark, ChartNoAxesColumn, ClipboardList } from "lucide-react";
import { PublicDiscoveryFeatureCard } from "./public-discovery-feature-card";

const features = [
  {
    title: "CV matching",
    description:
      "Build your profile so we can match jobs to your skills.",
    icon: ClipboardList,
    action: "Create your profile",
  },
  {
    title: "Saved Jobs",
    description:
      "Keep interesting opportunities together for later.",
    icon: Bookmark,
    iconClass: "text-accent",
    action: "Sign in to save jobs",
  },
  {
    title: "Track Applications",
    description:
      "Keep status and next steps in one place.",
    icon: ChartNoAxesColumn,
    iconClass: "text-accent",
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
      className="th-public-discovery-promo-sidebar flex min-h-0 min-w-0 flex-col gap-3 overflow-y-auto max-[1199px]:hidden"
    >
      <div>
        <h2 className="text-job font-bold leading-snug">
          Make more of your job search
        </h2>
        <p className="mt-1 text-detail leading-relaxed text-public-muted">
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
