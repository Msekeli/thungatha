"use client";
import type { UserProfileDto } from "../server/user-profile-schema";
import { ProfileCertificationsEditor } from "./profile-certifications-editor";
import { ProfileProjectsEditor } from "./profile-projects-editor";
import { ProfileAccordion } from "./profile-accordion";

export function ProfileExtraSectionsEditor({ certifications, projects, onCertsChange, onProjectsChange }: {
  certifications: UserProfileDto["certifications"]; projects: UserProfileDto["projects"];
  onCertsChange: (items: UserProfileDto["certifications"]) => void; onProjectsChange: (items: UserProfileDto["projects"]) => void;
}) {
  return <div className="space-y-3">
    <ProfileAccordion title="Certifications and licences" description="Optional — add relevant certificates or licences" status={certifications.length ? `${certifications.length} added` : "Optional"}>
      <ProfileCertificationsEditor items={certifications} onChange={onCertsChange} />
    </ProfileAccordion>
    <ProfileAccordion title="Projects" description="Optional — highlight relevant projects" status={projects.length ? `${projects.length} added` : "Optional"}>
      <ProfileProjectsEditor items={projects} onChange={onProjectsChange} />
    </ProfileAccordion>
  </div>;
}
