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
  const contactLine = [p.email, p.portfolioUrl].filter(Boolean).join(" · ");
  const counts = [
    profile.workExperience.length > 0 &&
      `${profile.workExperience.length} role${profile.workExperience.length > 1 ? "s" : ""}`,
    profile.education.length > 0 &&
      `${profile.education.length} education`,
    profile.certifications.length > 0 &&
      `${profile.certifications.length} certification${profile.certifications.length > 1 ? "s" : ""}`,
    profile.projects.length > 0 &&
      `${profile.projects.length} project${profile.projects.length > 1 ? "s" : ""}`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="rounded-xl border border-line bg-panel p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-fg-muted">
          Details
        </h2>
      </div>

      {roleLine && (
        <p className="mt-2 text-sm font-medium text-fg">{roleLine}</p>
      )}
      {contactLine && (
        <p className="mt-1 text-xs text-accent">{contactLine}</p>
      )}
      {profile.summary && (
        <p className="mt-3 text-xs leading-relaxed text-fg-muted sm:text-sm">
          {profile.summary}
        </p>
      )}

      {profile.skills.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {profile.skills.map((skill) => (
            <span
              key={skill}
              className="rounded bg-panel-2 px-2 py-0.5 text-xs text-fg"
            >
              {skill}
            </span>
          ))}
        </div>
      )}

      {counts && (
        <p className="mt-4 border-t border-line/60 pt-3 text-xs text-fg-muted">
          {counts}
        </p>
      )}
    </div>
  );
}
