"use client";

import type { UserProfileDto } from "../server/user-profile-schema";

export function ProfilePersonalDetailsForm({
  details,
  onChange,
}: {
  details: UserProfileDto["personalDetails"];
  onChange: (updated: UserProfileDto["personalDetails"]) => void;
}) {
  const update = (key: keyof UserProfileDto["personalDetails"], val: string) => {
    onChange({ ...details, [key]: val || null });
  };

  return (
    <div className="rounded-xl border border-line bg-panel p-5">
      <h2 className="text-sm font-semibold text-fg">Personal Details</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="display-name" className="block text-xs font-medium text-fg-muted">
            Display name
          </label>
          <input
            id="display-name"
            name="displayName"
            required
            value={details.fullName || ""}
            onChange={(e) => update("fullName", e.target.value)}
            className="mt-1 w-full rounded-lg border border-line bg-panel-2 px-3 py-2 text-xs text-fg outline-none focus:border-accent"
            placeholder="e.g. Lerato Naidoo"
          />
        </div>

        <div>
          <label htmlFor="profile-email" className="block text-xs font-medium text-fg-muted">
            Email
          </label>
          <input
            id="profile-email"
            type="email"
            value={details.email || ""}
            onChange={(e) => update("email", e.target.value)}
            className="mt-1 w-full rounded-lg border border-line bg-panel-2 px-3 py-2 text-xs text-fg outline-none focus:border-accent"
            placeholder="e.g. lerato@example.com"
          />
        </div>

        <div className={`rounded-lg p-2 ${!details.phone ? "border border-dashed border-warn/60 bg-warn-bg/10" : ""}`}>
          <div className="flex items-center justify-between">
            <label htmlFor="profile-phone" className="block text-xs font-medium text-fg-muted">Phone</label>
            {!details.phone && <span className="text-[10px] text-warn">Not found in CV</span>}
          </div>
          <input
            id="profile-phone"
            value={details.phone || ""}
            onChange={(e) => update("phone", e.target.value)}
            className="mt-1 w-full rounded border border-line bg-panel px-2.5 py-1.5 text-xs text-fg"
            placeholder="Add phone"
          />
        </div>

        <div className={`rounded-lg p-2 ${!details.location ? "border border-dashed border-warn/60 bg-warn-bg/10" : ""}`}>
          <div className="flex items-center justify-between">
            <label htmlFor="profile-location" className="block text-xs font-medium text-fg-muted">Location</label>
            {!details.location && <span className="text-[10px] text-warn">Not found in CV</span>}
          </div>
          <input
            id="profile-location"
            value={details.location || ""}
            onChange={(e) => update("location", e.target.value)}
            className="mt-1 w-full rounded border border-line bg-panel px-2.5 py-1.5 text-xs text-fg"
            placeholder="Add location (e.g. Cape Town)"
          />
        </div>
      </div>
    </div>
  );
}
