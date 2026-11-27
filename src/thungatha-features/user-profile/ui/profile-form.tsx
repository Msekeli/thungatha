"use client";

import { useAuth } from "@clerk/nextjs";
import { ProfileFormContent } from "./profile-form-content";

export function ProfileForm({
  initialMode,
  configured = true,
}: {
  initialMode?: "empty" | "view" | "edit";
  configured?: boolean;
}) {
  if (configured) return <AuthenticatedProfileForm initialMode={initialMode} />;
  return (
    <ProfileFormContent
      key="unconfigured"
      initialMode={initialMode}
      userId={null}
      enabled
    />
  );
}

function AuthenticatedProfileForm({
  initialMode,
}: {
  initialMode?: "empty" | "view" | "edit";
}) {
  const { userId, isLoaded } = useAuth();
  return (
    <ProfileFormContent
      key={userId ?? "signed-out"}
      initialMode={initialMode}
      userId={userId ?? null}
      enabled={isLoaded}
    />
  );
}
