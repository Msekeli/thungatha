import type { UserProfileDto } from "../server/user-profile-schema";
import { ProfileReviewSection } from "./profile-review-section";

export function ProfileReviewWork({
  profile,
  onEdit,
}: {
  profile: UserProfileDto;
  onEdit: () => void;
}) {
  return (
    <>
      <ProfileReviewSection title="Work experience" onEdit={onEdit}>
        {profile.workExperience.length ? (
          profile.workExperience.map((item) => (
            <article
              key={item.id}
              className="mb-4 break-inside-avoid last:mb-0"
            >
              <h3 className="font-semibold">
                {item.jobTitle} · {item.employer}
              </h3>
              <p className="text-muted-foreground print:text-gray-700">
                {item.startDate} –{" "}
                {item.isCurrent
                  ? "Present"
                  : item.endDate || "Date not specified"}
              </p>
              {item.location && (
                <p className="text-muted-foreground print:text-gray-700">
                  {item.location}
                </p>
              )}
              {item.description && (
                <p className="mt-2 whitespace-pre-wrap">{item.description}</p>
              )}
              {item.achievements?.length ? (
                <ul className="mt-2 list-disc pl-5">
                  {item.achievements.map((achievement, index) => (
                    <li key={index}>{achievement}</li>
                  ))}
                </ul>
              ) : null}
            </article>
          ))
        ) : (
          <p className="text-muted-foreground">No work experience added.</p>
        )}
      </ProfileReviewSection>
      <ProfileReviewSection title="Education" onEdit={onEdit}>
        {profile.education.length ? (
          profile.education.map((item) => (
            <article
              key={item.id}
              className="mb-3 break-inside-avoid last:mb-0"
            >
              <h3 className="font-semibold">{item.qualification}</h3>
              <p className="text-muted-foreground print:text-gray-700">
                {[item.educationLevel, item.institution, item.fieldOfStudy]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </article>
          ))
        ) : (
          <p className="text-muted-foreground">No education added.</p>
        )}
      </ProfileReviewSection>
    </>
  );
}
