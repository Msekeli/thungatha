"use client";

import { useState } from "react";
import type { ExtractedCvFields } from "./profile-cv-extraction";
import { useProfile } from "./use-profile";
import { ProfileFormStateView } from "./profile-state-view";
import type { UserProfileDto } from "../server/user-profile-schema";

export function ProfileFormContent({
  initialMode,
  userId,
  enabled,
}: {
  initialMode?: "empty" | "view" | "edit";
  userId: string | null;
  enabled: boolean;
}) {
  const data = useProfile(userId, enabled);
  const [reviewing, setReviewing] = useState(false);
  const currentMode = reviewing ? "review" : initialMode || data.mode;

  function handleExtracted(fields: ExtractedCvFields) {
    data.setDraft(mergeExtractedFields(data.draft, fields));
    setReviewing(true);
    data.setMode("edit");
  }

  if (data.loading)
    return (
      <ProfileFormStateView
        data={data}
        currentMode={currentMode}
        setReviewing={setReviewing}
        onExtracted={handleExtracted}
        loading
      />
    );

  if (data.loadFailed)
    return (
      <ProfileFormStateView
        data={data}
        currentMode={currentMode}
        setReviewing={setReviewing}
        onExtracted={handleExtracted}
        loadFailed
      />
    );

  return (
    <ProfileFormStateView
      data={data}
      currentMode={currentMode}
      setReviewing={setReviewing}
      onExtracted={handleExtracted}
    />
  );
}

function mergeExtractedFields(
  draft: UserProfileDto,
  fields: ExtractedCvFields,
): UserProfileDto {
  return {
    ...draft,
    displayName: draft.displayName || fields.fullName,
    personalDetails: {
      ...draft.personalDetails,
      fullName: draft.personalDetails.fullName || fields.fullName,
      email: draft.personalDetails.email || fields.email,
      phone: draft.personalDetails.phone || fields.phone,
      linkedinUrl: draft.personalDetails.linkedinUrl || fields.linkedinUrl,
      portfolioUrl: draft.personalDetails.portfolioUrl || fields.portfolioUrl,
    },
    summary: draft.summary || fields.summary,
    skills: draft.skills.length ? draft.skills : fields.skills,
    workExperience: draft.workExperience.length
      ? draft.workExperience
      : fields.workExperience,
    education: draft.education.length
      ? draft.education
      : fields.education.map((item) => ({ ...item, isCurrent: false })),
  };
}
