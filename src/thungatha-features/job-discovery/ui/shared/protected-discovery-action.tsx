"use client";

import type { ReactNode } from "react";
import { Show } from "@clerk/nextjs";
import { PublicAuthPrompt } from "../public/public-auth-prompt";

type Props = {
  configured: boolean;
  children: ReactNode;
  title: string;
  description: string;
  onAction?: () => void;
};

export function ProtectedDiscoveryAction({
  configured,
  children,
  title,
  description,
  onAction,
}: Props) {
  const prompt = (
    <PublicAuthPrompt configured={configured} title={title} description={description}>
      <span onClick={(event) => event.preventDefault()}>{children}</span>
    </PublicAuthPrompt>
  );
  if (!configured) return prompt;
  return (
    <>
      <Show when="signed-in">
        <span onClick={onAction}>{children}</span>
      </Show>
      <Show when="signed-out">{prompt}</Show>
    </>
  );
}
