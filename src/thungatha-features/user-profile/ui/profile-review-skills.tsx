import type { UserProfileDto } from "../server/user-profile-schema";
import { ProfileReviewSection } from "./profile-review-section";

export function ProfileReviewSkills({
  profile,
  onEdit,
}: {
  profile: UserProfileDto;
  onEdit: () => void;
}) {
  return (
    <>
      <ProfileReviewSection title="Skills" onEdit={onEdit}>
        {profile.skills.length ? (
          <p>{profile.skills.join(" · ")}</p>
        ) : (
          <p className="text-muted-foreground">No skills added.</p>
        )}
      </ProfileReviewSection>
      <ProfileReviewSection title="Certifications and licences" onEdit={onEdit}>
        {profile.certifications.length ? (
          profile.certifications.map((item) => (
            <p key={item.id} className="mb-2 last:mb-0">
              <strong>{item.name}</strong>
              {item.issuer ? ` · ${item.issuer}` : ""}
            </p>
          ))
        ) : (
          <p className="text-muted-foreground">No certifications added.</p>
        )}
      </ProfileReviewSection>
    </>
  );
}
