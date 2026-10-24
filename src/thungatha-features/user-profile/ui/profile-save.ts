import {
  profileCompletionSchema,
  type UserProfileDto,
} from "../server/user-profile-schema";

export async function saveProfileDraft(draft: UserProfileDto) {
  try {
    const complete = profileCompletionSchema.safeParse(draft).success;
    const {
      profileVersion: _version,
      createdAt: _created,
      updatedAt: _updated,
      ...editable
    } = draft;
    const payload = {
      ...editable,
      displayName:
        draft.personalDetails.fullName || draft.displayName || undefined,
      confirmedAt: complete ? new Date().toISOString() : null,
    };
    const response = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await response.json();
    if (!response.ok)
      return {
        error: json.error || "We couldn’t save your changes. Please try again.",
      };
    return { profile: json.profile as UserProfileDto };
  } catch {
    return {
      error:
        "We couldn’t save your changes. Check your connection and try again.",
    };
  }
}
