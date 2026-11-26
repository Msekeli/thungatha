import type { UserProfileDto } from "../server/user-profile-schema";
import { ProfileReviewSection } from "./profile-review-section";

export function ProfileReviewExtras({
  profile,
  onEdit,
}: {
  profile: UserProfileDto;
  onEdit: () => void;
}) {
  return (
    <>
      <ProfileReviewSection title="Projects" onEdit={onEdit}>
        {profile.projects.length ? (
          profile.projects.map((item) => (
            <article key={item.id} className="mb-3 last:mb-0">
              <h3 className="font-semibold">{item.name}</h3>
              {item.description && <p>{item.description}</p>}
            </article>
          ))
        ) : (
          <p className="text-muted-foreground">No projects added.</p>
        )}
      </ProfileReviewSection>
      <ProfileReviewSection title="Career preferences" onEdit={onEdit}>
        <p>
          <strong>Preferred next role:</strong>{" "}
          {profile.nextRole || "Not specified"}
        </p>
      </ProfileReviewSection>
      <ProfileReviewSection title="Interests and hobbies" onEdit={onEdit}>
        <p>
          {profile.personalAttributes.join(", ") ||
            "No interests or hobbies added."}
        </p>
      </ProfileReviewSection>
    </>
  );
}
