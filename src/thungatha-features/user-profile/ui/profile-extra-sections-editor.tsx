"use client";
import type { UserProfileDto } from "../server/user-profile-schema";
import { ProfileCertificationsEditor } from "./profile-certifications-editor";
import { ProfileProjectsEditor } from "./profile-projects-editor";
export function ProfileExtraSectionsEditor({ certifications, projects, onCertsChange, onProjectsChange }: {
  certifications: UserProfileDto["certifications"]; projects: UserProfileDto["projects"];
  onCertsChange: (items: UserProfileDto["certifications"]) => void; onProjectsChange: (items: UserProfileDto["projects"]) => void;
}) {
  return <div className="grid gap-4 sm:grid-cols-2"><ProfileCertificationsEditor items={certifications} onChange={onCertsChange} /><ProfileProjectsEditor items={projects} onChange={onProjectsChange} /></div>;
}
