import type { UserProfileDto } from "../server/user-profile-schema";
export function ProfileSavedDetailsCard({
  profile,
}: {
  profile: UserProfileDto;
}) {
  const p = profile.personalDetails;
  const current = profile.workExperience[0];
  const roleLine = [current?.jobTitle, current?.employer, p.location]
    .filter(Boolean)
    .join(" · ");
  const contacts = [p.email, p.phone, p.linkedinUrl, p.portfolioUrl]
    .filter(Boolean)
    .join(" · ");
  const residence = [
    p.residentialSuburb,
    p.residentialCity,
    p.residentialProvince,
    p.residentialPostalCode,
    p.country,
  ]
    .filter(Boolean)
    .join(", ");
  const counts = [
    profile.workExperience.length && `${profile.workExperience.length} role(s)`,
    profile.education.length && `${profile.education.length} education item(s)`,
    profile.certifications.length &&
      `${profile.certifications.length} certification(s)`,
    profile.projects.length && `${profile.projects.length} project(s)`,
  ]
    .filter(Boolean)
    .join(" · ");
  return (
    <section className="rounded-xl border border-border bg-card p-5 text-card-foreground shadow-sm">
      <h2 className="text-base font-semibold">Profile details</h2>
      {roleLine && <p className="mt-2 text-sm font-medium">{roleLine}</p>}
      {profile.nextRole && (
        <p className="mt-2 text-sm text-muted-foreground">
          Target role: {profile.nextRole}
        </p>
      )}
      {contacts && (
        <p className="mt-2 break-words text-sm text-primary">{contacts}</p>
      )}
      {residence && (
        <p className="mt-2 text-sm text-muted-foreground">
          Residential area: {residence}
        </p>
      )}
      {profile.summary && (
        <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
          {profile.summary}
        </p>
      )}
      {profile.skills.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {profile.skills.map((skill) => (
            <span
              key={skill}
              className="rounded-full border border-border bg-secondary px-3 py-1 text-sm"
            >
              {skill}
            </span>
          ))}
        </div>
      )}
      {profile.languages.length > 0 && (
        <p className="mt-3 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Languages:</span>{" "}
          {profile.languages.join(", ")}
        </p>
      )}
      {profile.personalAttributes.length > 0 && (
        <p className="mt-2 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">
            Personal attributes:
          </span>{" "}
          {profile.personalAttributes.join(", ")}
        </p>
      )}
      {counts && (
        <p className="mt-4 border-t border-border pt-3 text-xs text-muted-foreground">
          {counts}
        </p>
      )}
    </section>
  );
}
