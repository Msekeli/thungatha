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
import { ProfileAccordion } from "./profile-accordion";
import {
  isEducationComplete,
  isPersonalDetailsComplete,
} from "./profile-completion-status";

export function ProfileEditorFields({
  profile,
  onChange,
  onSave,
  saving,
}: {
  profile: UserProfileDto;
  onChange: (updated: UserProfileDto) => void;
  onSave: () => void;
  saving: boolean;
}) {
  const details = profile.personalDetails;
  const detailsComplete = isPersonalDetailsComplete(details);
  const educationComplete = isEducationComplete(profile.education);
  return (
    <div className="th-profile-editor-fields space-y-3">
      <ProfileAccordion
        title="Personal details"
        description="Contact and location information"
        status={detailsComplete ? "Complete" : "Required"}
        onSave={onSave}
        saving={saving}
      >
        <ProfilePersonalDetailsForm
          details={details}
          onChange={(personalDetails) => onChange({ ...profile, personalDetails })}
          languages={profile.languages}
          onLanguagesChange={(languages) => onChange({ ...profile, languages })}
        />
      </ProfileAccordion>
      <ProfileAccordion
        title="Professional summary"
        description="Introduce your experience and strengths"
        status={profile.summary?.trim() ? "Complete" : "Required"}
        onSave={onSave}
        saving={saving}
      >
        <ProfileSummaryForm
          summary={profile.summary}
          onChange={(summary) => onChange({ ...profile, summary })}
        />
      </ProfileAccordion>
      <ProfileAccordion
        title="Work experience"
        description="Your roles and responsibilities"
        status={profile.workExperience.length ? "Added" : "Optional"}
        onSave={onSave}
        saving={saving}
      >
        <ProfileExperienceEditor
          items={profile.workExperience}
          onChange={(workExperience) =>
            onChange({ ...profile, workExperience })
          }
        />
      </ProfileAccordion>
      <ProfileAccordion
        title="Education"
        description="Add your school, qualification or tertiary education"
        status={educationComplete ? "Added" : "Required"}
        onSave={onSave}
        saving={saving}
      >
        <ProfileEducationEditor
          items={profile.education}
          onChange={(education) => onChange({ ...profile, education })}
        />
      </ProfileAccordion>
      <ProfileAccordion
        title="Skills"
        description="Skills employers can search for"
        status={profile.skills.length ? "Added" : "Optional"}
        onSave={onSave}
        saving={saving}
      >
        <ProfileSkillsEditor
          skills={profile.skills}
          onChange={(skills) => onChange({ ...profile, skills })}
        />
      </ProfileAccordion>
      <ProfileExtraSectionsEditor
        certifications={profile.certifications}
        projects={profile.projects}
        onCertsChange={(certifications) =>
          onChange({ ...profile, certifications })
        }
        onProjectsChange={(projects) => onChange({ ...profile, projects })}
        onSave={onSave}
        saving={saving}
      />
      <ProfileAccordion
        title="Preferred next role"
        onSave={onSave}
        saving={saving}
        description="The type of role you want to pursue next"
        status={profile.nextRole?.trim() ? "Added" : "Optional"}
      >
        <ProfileNextRoleForm
          value={profile.nextRole}
          onChange={(nextRole) => onChange({ ...profile, nextRole })}
        />
      </ProfileAccordion>
      <ProfileAccordion
        title="Interests and hobbies"
        description="Optional — what you enjoy doing outside work"
        onSave={onSave}
        saving={saving}
        status={
          profile.personalAttributes.length
            ? "Added"
            : "Optional"
        }
      >
        <ProfileLanguageAttributesEditor
          attributes={profile.personalAttributes}
          onAttributesChange={(personalAttributes) =>
            onChange({ ...profile, personalAttributes })
          }
        />
      </ProfileAccordion>
    </div>
  );
}
