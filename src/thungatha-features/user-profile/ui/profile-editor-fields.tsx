"use client";

import type { UserProfileDto } from "../server/user-profile-schema";
import { ProfilePersonalDetailsForm } from "./profile-personal-details-form";
import { ProfileNextRoleForm } from "./profile-next-role-form";
import { ProfileSummaryForm } from "./profile-summary-form";
import { ProfileExperienceEditor } from "./profile-experience-editor";
import { ProfileEducationEditor } from "./profile-education-editor";
import { ProfileSkillsEditor } from "./profile-skills-editor";
import { ProfileExtraSectionsEditor } from "./profile-extra-sections-editor";
import { ProfileLanguageAttributesEditor } from "./profile-language-attributes-editor";

export function ProfileEditorFields({
  profile,
  onChange,
}: {
  profile: UserProfileDto;
  onChange: (updated: UserProfileDto) => void;
}) {
  return (
    <div className="th-profile-editor-fields space-y-5">
      <ProfilePersonalDetailsForm
        details={profile.personalDetails}
        onChange={(personalDetails) =>
          onChange({ ...profile, personalDetails })
        }
      />
      <ProfileNextRoleForm
        value={profile.nextRole}
        onChange={(nextRole) => onChange({ ...profile, nextRole })}
      />
      <ProfileSummaryForm
        summary={profile.summary}
        onChange={(summary) => onChange({ ...profile, summary })}
      />
      <ProfileExperienceEditor
        items={profile.workExperience}
        onChange={(workExperience) => onChange({ ...profile, workExperience })}
      />
      <ProfileEducationEditor
        items={profile.education}
        onChange={(education) => onChange({ ...profile, education })}
      />
      <ProfileSkillsEditor
        skills={profile.skills}
        onChange={(skills) => onChange({ ...profile, skills })}
      />
      <ProfileLanguageAttributesEditor
        languages={profile.languages}
        attributes={profile.personalAttributes}
        onLanguagesChange={(languages) => onChange({ ...profile, languages })}
        onAttributesChange={(personalAttributes) =>
          onChange({ ...profile, personalAttributes })
        }
      />
      <ProfileExtraSectionsEditor
        certifications={profile.certifications}
        projects={profile.projects}
        onCertsChange={(certifications) =>
          onChange({ ...profile, certifications })
        }
        onProjectsChange={(projects) => onChange({ ...profile, projects })}
      />
    </div>
  );
}
