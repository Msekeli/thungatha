"use client";

import { Button } from "@/components/ui/button";
import { ProfileCvUpload } from "./profile-cv-upload";
import type { UserProfileDto } from "../server/user-profile-schema";
import { ProfileSavedDetailsCard } from "./profile-saved-details-card";
import {
  ProfileMasterCvCard,
  ProfileSavedSectionCard,
} from "./profile-saved-section-card";

export function ProfileSavedView({
  profile,
  onEdit,
}: {
  profile: UserProfileDto;
  onEdit: () => void;
}) {
  const p = profile.personalDetails;
  const name = p.fullName || profile.displayName || "Your Profile";
  const confirmedText = profile.confirmedAt
    ? `Confirmed ${new Date(profile.confirmedAt).toLocaleDateString()}`
    : "Unconfirmed Draft";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-fg-muted">Your information</p>
          <div className="mt-1 flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-fg">{name}</h1>
            <span className={`rounded px-2 py-0.5 text-xs font-medium ${profile.confirmedAt ? "bg-accent/15 text-accent" : "bg-warn-bg text-warn"}`}>
              {confirmedText}
            </span>
          </div>
        </div>
        <Button type="button" variant="primary" onClick={onEdit}>Edit profile</Button>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <ProfileSavedDetailsCard profile={profile} />
        </div>

        <ProfileSavedSectionCard title="Work Experience" count={profile.workExperience.length}>
          {profile.workExperience.map((exp) => (
            <div key={exp.id} className="py-2.5 first:pt-0 last:pb-0">
              <p className="text-xs font-semibold text-fg">{exp.jobTitle} · {exp.employer}</p>
              <p className="text-[11px] text-fg-muted">
                {exp.startDate} – {exp.isCurrent ? "Present" : exp.endDate || "Present"}{exp.location ? ` · ${exp.location}` : ""}
              </p>
            </div>
          ))}
        </ProfileSavedSectionCard>

        <ProfileSavedSectionCard title="Education" count={profile.education.length}>
          {profile.education.map((edu) => (
            <div key={edu.id} className="py-2.5 first:pt-0 last:pb-0">
              <p className="text-xs font-semibold text-fg">{edu.qualification}</p>
              <p className="text-[11px] text-fg-muted">{edu.institution} {edu.endDate ? `· ${edu.endDate}` : ""}</p>
            </div>
          ))}
        </ProfileSavedSectionCard>

        <ProfileSavedSectionCard title="Certifications" count={profile.certifications.length}>
          {profile.certifications.map((cert) => <div key={cert.id} className="py-2.5"><p className="text-xs font-semibold text-fg">{cert.name}</p>{cert.issuer && <p className="text-[11px] text-fg-muted">{cert.issuer}</p>}{(cert.issueDate || cert.expiryDate) && <p className="text-[11px] text-fg-muted">{cert.issueDate || ""}{cert.issueDate && cert.expiryDate ? " – " : ""}{cert.expiryDate || ""}</p>}</div>)}
        </ProfileSavedSectionCard>
        <ProfileSavedSectionCard title="Projects" count={profile.projects.length}>
          {profile.projects.map((project) => <div key={project.id} className="py-2.5"><p className="text-xs font-semibold text-fg">{project.name}</p>{project.role && <p className="text-[11px] text-fg-muted">{project.role}</p>}{project.description && <p className="whitespace-pre-wrap text-xs text-fg-muted">{project.description}</p>}{project.url && <a className="break-all text-xs text-accent underline" href={project.url} target="_blank" rel="noreferrer">{project.url}</a>}</div>)}
        </ProfileSavedSectionCard>
        <ProfileMasterCvCard
          filename={profile.masterCv?.filename}
          fileSize={profile.masterCv?.fileSize}
          uploadedAt={profile.masterCv?.uploadedAt}
        />
        <div className="md:col-span-2"><ProfileCvUpload hasCurrentCv={Boolean(profile.masterCv)} /></div>
      </div>
    </div>
  );
}
