"use client";
import type { UserProfileDto } from "../server/user-profile-schema";
import { ProfileCertificationsEditor } from "./profile-certifications-editor";
import { ProfileProjectsEditor } from "./profile-projects-editor";
import { ProfileAccordion } from "./profile-accordion";

export function ProfileExtraSectionsEditor({
  certifications,
  projects,
  onCertsChange,
  onCertsSave,
  onProjectsChange,
  onSave,
  saving,
}: {
  certifications: UserProfileDto["certifications"];
  projects: UserProfileDto["projects"];
  onCertsChange: (items: UserProfileDto["certifications"]) => void;
  onCertsSave: (items: UserProfileDto["certifications"]) => void;
  onProjectsChange: (items: UserProfileDto["projects"]) => void;
  onSave: () => void;
  saving: boolean;
}) {
  return (
    <div className="space-y-3">
      <ProfileAccordion
        title="Certifications and licences"
        description="Optional — add relevant certificates or licences"
        onSave={onSave}
        saving={saving}
        status={
          certifications.length ? `${certifications.length} added` : "Optional"
        }
      >
        <ProfileCertificationsEditor
          items={certifications}
          onChange={onCertsChange}
          onSave={onCertsSave}
        />
      </ProfileAccordion>
      <ProfileAccordion
        title="Projects"
        description="Optional — highlight relevant projects"
        onSave={onSave}
        saving={saving}
        status={projects.length ? `${projects.length} added` : "Optional"}
      >
        <ProfileProjectsEditor items={projects} onChange={onProjectsChange} />
      </ProfileAccordion>
    </div>
  );
}
