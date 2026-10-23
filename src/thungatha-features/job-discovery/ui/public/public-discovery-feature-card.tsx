"use client";

import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicAuthPrompt } from "./public-auth-prompt";

export function PublicDiscoveryFeatureCard({
  configured,
  title,
  description,
  note,
  icon: Icon,
  iconClass,
  action,
}: {
  configured: boolean;
  title: string;
  description: string;
  note: string;
  icon: LucideIcon;
  iconClass: string;
  action: string;
}) {
  return (
    <article className="flex min-w-0 gap-3 rounded-xl border border-line bg-panel p-3">
      <div className={`flex shrink-0 pt-0.5 ${iconClass}`}>
        <Icon size={20} aria-hidden="true" />
      </div>
      <div className="flex min-w-0 flex-col items-start gap-2">
        <h3 className="text-sm font-bold">{title}</h3>
        <p className="text-sm text-muted">{description}</p>
        <p className="text-xs text-muted">{note}</p>
        <PublicAuthPrompt
          configured={configured}
          title={title}
          description={`Sign in or create a free account to access ${title.toLowerCase()} and keep your job search organised.`}
        >
          <Button variant="outline" size="sm" className="whitespace-normal text-left">
            {action}
          </Button>
        </PublicAuthPrompt>
      </div>
    </article>
  );
}
