"use client";

import { Button } from "@/components/ui/button";
import type { UserProfileDto } from "../server/user-profile-schema";

export function ProfileEditorSidebar({
  profile,
  saving,
  onSave,
  onCancel,
}: {
  profile: UserProfileDto;
  saving: boolean;
  onSave: () => void;
  onCancel: () => void;
}) {
  const p = profile.personalDetails;
  const sections = [
    { label: "Personal Details", status: p.fullName ? "Ready" : "Incomplete" },
    { label: "Summary", status: profile.summary ? "Added" : "Empty" },
    { label: "Work Experience", status: `${profile.workExperience.length} added` },
    { label: "Education", status: `${profile.education.length} added` },
    { label: "Skills", status: `${profile.skills.length} skills` },
    { label: "Certifications", status: `${profile.certifications.length}` },
    { label: "Projects", status: `${profile.projects.length}` },
  ];

  return (
    <div className="rounded-xl border border-line bg-panel p-5 space-y-5">
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-fg-muted">
          Review progress
        </h2>
        <div className="mt-3 divide-y divide-line/40 text-xs">
          {sections.map((sec) => (
            <div key={sec.label} className="flex justify-between py-2 text-fg-muted">
              <span>{sec.label}</span>
              <span className="font-medium text-fg">{sec.status}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-fg-muted border-t border-line/60 pt-3">
        Nothing is saved until you press Save profile.
      </p>

      <div className="flex flex-col gap-2 pt-1">
        <Button
          type="button"
          variant="primary"
          disabled={saving}
          onClick={onSave}
          className="w-full"
        >
          {saving ? "Saving…" : "Save profile"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={saving}
          onClick={onCancel}
          className="w-full"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
