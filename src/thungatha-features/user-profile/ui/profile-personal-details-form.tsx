"use client";

import { Input } from "@/components/ui/input";
import type { UserProfileDto } from "../server/user-profile-schema";

type Details = UserProfileDto["personalDetails"];

export function ProfilePersonalDetailsForm({ details, onChange }: {
  details: Details;
  onChange: (updated: Details) => void;
}) {
  const update = (key: keyof Details, value: string) =>
    onChange({ ...details, [key]: value || null });
  const fields: Array<[keyof Details, string, string, string?]> = [
    ["fullName", "Full name", "e.g. Lerato Naidoo"],
    ["email", "Email", "you@example.com", "email"],
    ["phone", "Phone", "Phone number", "tel"],
    ["location", "Professional location", "City or region"],
    ["country", "Country", "Country"],
    ["residentialSuburb", "Residential area / suburb", "Suburb or neighbourhood"],
    ["residentialCity", "Residential city / town", "City or town"],
    ["residentialProvince", "Province / region", "Province or region"],
    ["residentialPostalCode", "Postal code", "Optional postal code"],
    ["linkedinUrl", "LinkedIn URL", "https://linkedin.com/in/you", "url"],
    ["portfolioUrl", "Portfolio URL", "https://your-site.example", "url"],
  ];
  return (
    <section className="rounded-xl border border-line bg-card p-5">
      <h2 className="text-sm font-semibold text-card-foreground">Personal and contact details</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Only add details you want to include in your professional profile.
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {fields.map(([key, label, placeholder, type]) => (
          <div key={key} className="space-y-1.5">
            <label htmlFor={String(key)} className="text-sm font-medium text-foreground">{label}</label>
            <Input
              id={String(key)}
              type={type || "text"}
              value={details[key] || ""}
              onChange={(event) => update(key, event.target.value)}
              placeholder={placeholder}
              autoComplete={key === "fullName" ? "name" : key === "email" ? "email" : key === "phone" ? "tel" : undefined}
            />
            {key === "residentialSuburb" && (
              <p className="text-xs text-muted-foreground">No street address or house number needed.</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
