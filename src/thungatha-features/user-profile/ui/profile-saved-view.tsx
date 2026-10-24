"use client";
import { Button } from "@/components/ui/button";
import { ProfileCvUpload } from "./profile-cv-upload";
import type { UserProfileDto } from "../server/user-profile-schema";
import { ProfileSavedDetailsCard } from "./profile-saved-details-card";
import { ProfileMasterCvCard } from "./profile-saved-section-card";
import { ProfileSavedEntries } from "./profile-saved-entries";
export function ProfileSavedView({ profile, onEdit }: { profile: UserProfileDto; onEdit: () => void }) {
  const name = profile.personalDetails.fullName || profile.displayName || "Your Profile";
  const status = profile.confirmedAt ? `Confirmed ${new Date(profile.confirmedAt).toLocaleDateString()}` : "Unconfirmed draft";
  return <div className="space-y-6">
    <header className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
      <div><p className="text-sm font-medium text-muted-foreground">Your information</p><h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">{name}</h1><p className="mt-1 text-sm text-muted-foreground">{status}</p></div>
      <Button onClick={onEdit}>Edit profile</Button>
    </header>
    <div className="grid gap-4 md:grid-cols-2">
      <div className="md:col-span-2"><ProfileSavedDetailsCard profile={profile} /></div>
      <ProfileSavedEntries profile={profile} />
      <ProfileMasterCvCard filename={profile.masterCv?.filename} fileSize={profile.masterCv?.fileSize} uploadedAt={profile.masterCv?.uploadedAt} />
      <div className="md:col-span-2"><ProfileCvUpload hasCurrentCv={Boolean(profile.masterCv)} /></div>
    </div>
  </div>;
}
