"use client";

import type { UserProfileDto } from "../server/user-profile-schema";

export function ProfilePersonalDetailsForm({
  details,
  onChange,
}: {
  details: UserProfileDto["personalDetails"];
  onChange: (updated: UserProfileDto["personalDetails"]) => void;
}) {
  const update = (
    key: keyof UserProfileDto["personalDetails"],
    value: string,
  ) => onChange({ ...details, [key]: value || null });
  const fields: Array<
    [keyof UserProfileDto["personalDetails"], string, string, string?]
  > = [
    ["fullName", "Full name", "e.g. Lerato Naidoo"],
    ["email", "Email", "you@example.com", "email"],
    ["phone", "Phone", "Phone number"],
    ["location", "Professional location", "City or region"],
    ["country", "Country", "Country"],
    [
      "residentialSuburb",
      "Residential area / suburb",
      "Suburb or neighbourhood",
    ],
    ["residentialCity", "Residential city / town", "City or town"],
    ["residentialProvince", "Province / region", "Province or region"],
    ["residentialPostalCode", "Postal code", "Optional postal code"],
    ["linkedinUrl", "LinkedIn URL", "https://linkedin.com/in/you", "url"],
    ["portfolioUrl", "Portfolio URL", "https://your-site.example", "url"],
  ];
  return (
    <section className="rounded-xl border border-line bg-panel p-5">
      <div>
        <h2 className="text-sm font-semibold text-fg">
          Personal and contact details
        </h2>
        <p className="mt-1 text-xs text-fg-muted">
          Only add details you want to include in your professional profile.
        </p>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {fields.map(([key, label, placeholder, type]) => (
          <div key={key}>
            <label
              htmlFor={String(key)}
              className="block text-xs font-medium text-fg-muted"
            >
              {label}
            </label>
            <input
              id={String(key)}
              type={type || "text"}
              value={details[key] || ""}
              onChange={(event) => update(key, event.target.value)}
              className="mt-1 w-full rounded-lg border border-line bg-panel-2 px-3 py-2 text-sm text-fg outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              placeholder={placeholder}
            />
            {key === "residentialSuburb" && (
              <p className="mt-1 text-[11px] text-fg-muted">
                No street address or house number needed.
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
