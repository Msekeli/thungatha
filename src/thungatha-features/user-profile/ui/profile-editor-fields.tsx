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

export function ProfileEditorFields({ profile, onChange }: {
  profile: UserProfileDto;
  onChange: (updated: UserProfileDto) => void;
}) {
  const details = profile.personalDetails;
  const requiredDetails = [details.fullName, details.email, details.phone, details.location, details.country, details.residentialSuburb, details.residentialCity, details.residentialProvince];
  const detailsComplete = requiredDetails.every((value) => Boolean(value?.trim()));
  return <div className="th-profile-editor-fields space-y-3">
    <ProfileAccordion title="Personal details" description="Contact and location information" status={detailsComplete ? "Complete" : "Required"}>
      <ProfilePersonalDetailsForm details={details} onChange={(personalDetails) => onChange({ ...profile, personalDetails })} />
    </ProfileAccordion>
    <ProfileAccordion title="Preferred next role" description="Help us find relevant opportunities" status="Optional">
      <ProfileNextRoleForm value={profile.nextRole} onChange={(nextRole) => onChange({ ...profile, nextRole })} />
    </ProfileAccordion>
    <ProfileAccordion title="Professional summary" description="Introduce your experience and strengths" status={profile.summary?.trim() ? "Added" : "Optional"}>
      <ProfileSummaryForm summary={profile.summary} onChange={(summary) => onChange({ ...profile, summary })} />
    </ProfileAccordion>
    <ProfileAccordion title="Work experience" description="Your recent roles and responsibilities" status={profile.workExperience.length ? `${profile.workExperience.length} added` : "Optional"}>
      <ProfileExperienceEditor items={profile.workExperience} onChange={(workExperience) => onChange({ ...profile, workExperience })} />
    </ProfileAccordion>
    <ProfileAccordion title="Education" description="At least one complete education record is required for profile completion" status={profile.education.length ? `${profile.education.length} added` : "Required"}>
      <ProfileEducationEditor items={profile.education} onChange={(education) => onChange({ ...profile, education })} />
    </ProfileAccordion>
    <ProfileAccordion title="Skills" description="Skills employers can search for" status={profile.skills.length ? `${profile.skills.length} added` : "Optional"}>
      <ProfileSkillsEditor skills={profile.skills} onChange={(skills) => onChange({ ...profile, skills })} />
    </ProfileAccordion>
    <ProfileAccordion title="Languages and personal attributes" description="Add details that apply to you" status={profile.languages.length + profile.personalAttributes.length ? "Added" : "Optional"}>
      <ProfileLanguageAttributesEditor languages={profile.languages} attributes={profile.personalAttributes} onLanguagesChange={(languages) => onChange({ ...profile, languages })} onAttributesChange={(personalAttributes) => onChange({ ...profile, personalAttributes })} />
    </ProfileAccordion>
    <ProfileExtraSectionsEditor certifications={profile.certifications} projects={profile.projects} onCertsChange={(certifications) => onChange({ ...profile, certifications })} onProjectsChange={(projects) => onChange({ ...profile, projects })} />
  </div>;
}
