import type { UserProfileDto } from "../server/user-profile-schema";
import { ProfileSavedSectionCard } from "./profile-saved-section-card";
export function ProfileSavedEntries({ profile }: { profile: UserProfileDto }) {
  return <>
    <ProfileSavedSectionCard title="Work experience" count={profile.workExperience.length}>
      {profile.workExperience.map((item) => <div key={item.id} className="py-3 first:pt-0"><p className="text-sm font-medium">{item.jobTitle} · {item.employer}</p><p className="text-sm text-muted-foreground">{item.startDate} – {item.isCurrent ? "Present" : item.endDate || "Not specified"}{item.location ? ` · ${item.location}` : ""}</p>{item.description && <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{item.description}</p>}</div>)}
    </ProfileSavedSectionCard>
    <ProfileSavedSectionCard title="Education" count={profile.education.length}>
      {profile.education.map((item) => <div key={item.id} className="py-3 first:pt-0"><p className="text-sm font-medium">{item.qualification}</p><p className="text-sm text-muted-foreground">{item.institution}{item.endDate ? ` · ${item.endDate}` : ""}</p></div>)}
    </ProfileSavedSectionCard>
    <ProfileSavedSectionCard title="Certifications" count={profile.certifications.length}>
      {profile.certifications.map((item) => <div key={item.id} className="py-3 first:pt-0"><p className="text-sm font-medium">{item.name}</p>{item.issuer && <p className="text-sm text-muted-foreground">{item.issuer}</p>}{(item.issueDate || item.expiryDate) && <p className="text-xs text-muted-foreground">{item.issueDate || ""}{item.issueDate && item.expiryDate ? " – " : ""}{item.expiryDate || ""}</p>}</div>)}
    </ProfileSavedSectionCard>
    <ProfileSavedSectionCard title="Projects" count={profile.projects.length}>
      {profile.projects.map((item) => <div key={item.id} className="py-3 first:pt-0"><p className="text-sm font-medium">{item.name}</p>{item.role && <p className="text-sm text-muted-foreground">{item.role}</p>}{item.description && <p className="whitespace-pre-wrap text-sm text-muted-foreground">{item.description}</p>}{item.url && <a className="break-all text-sm text-primary underline" href={item.url} target="_blank" rel="noreferrer">{item.url}</a>}</div>)}
    </ProfileSavedSectionCard>
  </>;
}
