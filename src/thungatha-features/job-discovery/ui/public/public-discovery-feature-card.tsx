"use client";

import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicAuthPrompt } from "./public-auth-prompt";

export function PublicDiscoveryFeatureCard({
  configured, title, description, icon: Icon, action,
}: {
  configured: boolean;
  title: string;
  description: string;
  icon: LucideIcon;
  action: string;
}) {
  return (
    <article className="flex min-w-0 gap-2 rounded-2xl border border-public-card-border bg-public-card-bg p-3 shadow-public-card">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-accent/30 bg-accent-bg text-accent-text">
        <Icon size={19} strokeWidth={2.25} aria-hidden="true" />
      </div>
      <div className="flex min-w-0 flex-col items-start gap-2">
        <h3 className="text-control font-bold text-fg">{title}</h3>
        <p className="text-detail text-public-muted">{description}</p>
        <PublicAuthPrompt configured={configured} title={title} description={`Sign in or create a free account to access ${title.toLowerCase()} and keep your job search organised.`}>
          <Button variant="outline" size="sm" className="whitespace-normal rounded-xl border-accent-text px-3 text-left text-detail text-accent-text">{action}</Button>
        </PublicAuthPrompt>
      </div>
    </article>
  );
}
