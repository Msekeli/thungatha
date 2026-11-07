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
    <article className="group/promo flex min-w-0 gap-3 rounded-2xl border border-public-card-border bg-gradient-to-br from-public-card-bg to-public-location-bg p-3.5 shadow-public-card transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-card-hover hover:shadow-card-hover motion-reduce:transition-none motion-reduce:hover:transform-none">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-logo-border bg-gradient-to-br from-public-band-from to-public-band-to text-on-band shadow-public-card transition-transform duration-200 group-hover/promo:scale-105">
        <Icon size={20} strokeWidth={2.25} aria-hidden="true" />
      </div>
      <div className="flex min-w-0 flex-col items-start gap-2">
        <h3 className="text-job font-bold leading-snug text-fg">{title}</h3>
        <p className="text-control leading-relaxed text-fg-muted">{description}</p>
        <PublicAuthPrompt configured={configured} title={title} description={`Sign in or create a free account to access ${title.toLowerCase()} and keep your job search organised.`}>
          <Button variant="outline" size="sm" className="min-h-9 whitespace-normal rounded-xl border-accent-text px-3 text-left text-control font-semibold text-accent-text">{action}</Button>
        </PublicAuthPrompt>
      </div>
    </article>
  );
}
