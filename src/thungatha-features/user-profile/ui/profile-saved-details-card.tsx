import type { UserProfileDto } from "../server/user-profile-schema";

export function ProfileSavedDetailsCard({
  profile,
}: {
  profile: UserProfileDto;
}) {
  const p = profile.personalDetails;
  const topRole = profile.workExperience[0];
  const roleLine = [topRole?.jobTitle, topRole?.employer, p.location]
    .filter(Boolean)
    .join(" · ");
  const contactLine = [p.email, p.phone, p.linkedinUrl, p.portfolioUrl]
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
    profile.workExperience.length > 0 &&
      `${profile.workExperience.length} role(s)`,
    profile.education.length > 0 &&
      `${profile.education.length} education item(s)`,
    profile.certifications.length > 0 &&
      `${profile.certifications.length} certification(s)`,
    profile.projects.length > 0 && `${profile.projects.length} project(s)`,
  ]
    .filter(Boolean)
    .join(" · ");
  return (
    <div className="rounded-xl border border-line bg-panel p-5">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-fg-muted">
        Details
      </h2>
      {roleLine && (
        <p className="mt-2 text-sm font-medium text-fg">{roleLine}</p>
      )}
      {contactLine && (
        <p className="mt-1 break-words text-xs text-accent">{contactLine}</p>
      )}
      {residence && (
        <p className="mt-2 text-xs text-fg-muted">
          Residential area: {residence}
        </p>
      )}
      {profile.summary && (
        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-fg-muted">
          {profile.summary}
        </p>
      )}
      {profile.skills.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {profile.skills.map((skill) => (
            <span
              key={skill}
              className="rounded bg-panel-2 px-2 py-1 text-xs text-fg"
            >
              {skill}
            </span>
          ))}
        </div>
      )}
      {profile.languages.length > 0 && (
        <p className="mt-3 text-xs text-fg-muted">
          <span className="font-medium text-fg">Languages:</span>{" "}
          {profile.languages.join(", ")}
        </p>
      )}
      {profile.personalAttributes.length > 0 && (
        <p className="mt-2 text-xs text-fg-muted">
          <span className="font-medium text-fg">Personal attributes:</span>{" "}
          {profile.personalAttributes.join(", ")}
        </p>
      )}
      {counts && (
        <p className="mt-4 border-t border-line/60 pt-3 text-xs text-fg-muted">
          {counts}
        </p>
      )}
    </div>
  );
}
