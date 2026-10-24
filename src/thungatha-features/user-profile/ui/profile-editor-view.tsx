"use client";

import type { UserProfileDto } from "../server/user-profile-schema";
import { ProfilePersonalDetailsForm } from "./profile-personal-details-form";
import { ProfileSummaryForm } from "./profile-summary-form";
import { ProfileExperienceEditor } from "./profile-experience-editor";
import { ProfileEducationEditor } from "./profile-education-editor";
import { ProfileSkillsEditor } from "./profile-skills-editor";
import { ProfileExtraSectionsEditor } from "./profile-extra-sections-editor";
import { ProfileEditorSidebar } from "./profile-editor-sidebar";

export function ProfileEditorView({
  profile,
  saving,
  onChange,
  onSave,
  onCancel,
}: {
  profile: UserProfileDto;
  saving: boolean;
  onChange: (updated: UserProfileDto) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-fg-muted">Profile · Manual Entry</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-fg">Edit your details</h1>
        <p className="mt-2 rounded-lg bg-panel-2 p-3 text-xs text-fg-muted">
          Check each section and correct anything that is wrong. Nothing is saved until you press Save profile.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <ProfilePersonalDetailsForm
            details={profile.personalDetails}
            onChange={(personalDetails) => onChange({ ...profile, personalDetails })}
          />
          <ProfileSummaryForm summary={profile.summary} onChange={(summary) => onChange({ ...profile, summary })} />
          <ProfileExperienceEditor
            items={profile.workExperience}
            onChange={(workExperience) => onChange({ ...profile, workExperience })}
          />
          <ProfileEducationEditor
            items={profile.education}
            onChange={(education) => onChange({ ...profile, education })}
          />
          <ProfileSkillsEditor skills={profile.skills} onChange={(skills) => onChange({ ...profile, skills })} />
          <ProfileExtraSectionsEditor
            certifications={profile.certifications}
            projects={profile.projects}
            onCertsChange={(certifications) => onChange({ ...profile, certifications })}
            onProjectsChange={(projects) => onChange({ ...profile, projects })}
          />
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <ProfileEditorSidebar profile={profile} saving={saving} onSave={onSave} onCancel={onCancel} />
          </div>
        </div>
      </div>
    </div>
  );
}
