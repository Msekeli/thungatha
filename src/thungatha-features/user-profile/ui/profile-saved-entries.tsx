import type { UserProfileDto } from "../server/user-profile-schema";
import { displayProfileMonth } from "./profile-date-utils";
import { ProfileSavedSectionCard } from "./profile-saved-section-card";
const certificationType: Record<string, string> = {
  "professional-certification": "Professional certification",
  "occupational-certificate": "Occupational or trade certificate",
  "professional-licence": "Professional licence",
  "drivers-licence": "Driver's licence",
  other: "Other",
};
export function ProfileSavedEntries({ profile }: { profile: UserProfileDto }) {
  return (
    <>
      <ProfileSavedSectionCard
        title="Work experience"
        count={profile.workExperience.length}
      >
        {profile.workExperience.map((item) => (
          <div key={item.id} className="py-3 first:pt-0">
            <p className="text-sm font-medium">
              {item.jobTitle} · {item.employer}
            </p>
            <p className="text-sm text-muted-foreground">
              {item.startDate} –{" "}
              {item.isCurrent ? "Present" : item.endDate || "Not specified"}
              {item.location ? ` · ${item.location}` : ""}
            </p>
            {item.description && (
              <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                {item.description}
              </p>
            )}
          </div>
        ))}
      </ProfileSavedSectionCard>
      <ProfileSavedSectionCard
        title="Education"
        count={profile.education.length}
      >
        {profile.education.map((item) => (
          <div key={item.id} className="py-3 first:pt-0">
            <p className="text-sm font-medium">{item.qualification}</p>
            <p className="text-sm text-muted-foreground">
              {item.educationLevel ? `${item.educationLevel} · ` : ""}
              {item.institution}
            </p>
            {item.fieldOfStudy && (
              <p className="text-sm text-muted-foreground">
                Field of study: {item.fieldOfStudy}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              {item.startDate
                ? displayProfileMonth(item.startDate)
                : "Start date not specified"}{" "}
              –{" "}
              {item.isCurrent
                ? `Currently studying${item.endDate ? ` · expected ${displayProfileMonth(item.endDate)}` : ""}`
                : item.endDate
                  ? displayProfileMonth(item.endDate)
                  : "End date not specified"}
            </p>
          </div>
        ))}
      </ProfileSavedSectionCard>
      <ProfileSavedSectionCard
        title="Certifications and licences"
        count={profile.certifications.length}
      >
        {profile.certifications.map((item) => (
          <div key={item.id} className="py-3 first:pt-0">
            <p className="text-sm font-medium">{item.name}</p>
            <p className="text-xs text-muted-foreground">
              {certificationType[item.type || ""] || "Certification or licence"}
              {item.issuer ? ` · ${item.issuer}` : ""}
              {item.issuingCountry ? ` · Issued in ${item.issuingCountry}` : ""}
            </p>
            {item.licenceCategories?.length ? (
              <p className="text-sm text-muted-foreground">
                Categories:{" "}
                {item.licenceCategories
                  .map((code) => `Code ${code}`)
                  .join(", ")}
              </p>
            ) : null}
            {(item.issueDate || item.expiryDate) && (
              <p className="text-xs text-muted-foreground">
                {item.issueDate
                  ? displayProfileMonth(item.issueDate)
                  : "Issue date not specified"}
                {item.issueDate && item.expiryDate ? " – " : ""}
                {item.expiryDate ? displayProfileMonth(item.expiryDate) : ""}
              </p>
            )}
          </div>
        ))}
      </ProfileSavedSectionCard>
      <ProfileSavedSectionCard title="Projects" count={profile.projects.length}>
        {profile.projects.map((item) => (
          <div key={item.id} className="py-3 first:pt-0">
            <p className="text-sm font-medium">{item.name}</p>
            {item.role && (
              <p className="text-sm text-muted-foreground">{item.role}</p>
            )}
            {item.description && (
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                {item.description}
              </p>
            )}
            {item.url && (
              <a
                className="break-all text-sm text-primary underline"
                href={item.url}
                target="_blank"
                rel="noreferrer"
              >
                {item.url}
              </a>
            )}
          </div>
        ))}
      </ProfileSavedSectionCard>
    </>
  );
}
