import "server-only";
import {
  profileCompletionSchema,
  type UserProfileDto,
} from "@/thungatha-features/user-profile/server/user-profile-schema";

export function getProfileCompletion(profile: UserProfileDto) {
  const result = profileCompletionSchema.safeParse(profile);
  if (result.success) return { complete: true, missing: [] as string[] };
  const labels: Record<string, string> = {
    "personalDetails.fullName": "Full name",
    "personalDetails.email": "Email address",
    "personalDetails.phone": "Phone number",
    "personalDetails.location": "Location",
    "personalDetails.country": "Country",
    "personalDetails.residentialSuburb": "Residential suburb",
    "personalDetails.residentialCity": "Residential city",
    "personalDetails.residentialProvince": "Province",
    summary: "Professional summary",
    education: "At least one education record",
  };
  const missing = [
    ...new Set(result.error.issues.map((issue) => {
      const path = issue.path.join(".");
      return labels[path] ??
        (path.startsWith("education") ? labels.education : path);
    })),
  ];
  return { complete: false, missing };
}
