"use client";
import { Input } from "@/components/ui/input";
import type { UserProfileDto } from "../server/user-profile-schema";
type Details = UserProfileDto["personalDetails"];
type Field = [keyof Details, string, string, string?, boolean?];
const fields: Field[] = [
  ["fullName", "Full name", "e.g. Lerato Naidoo", undefined, true],
  ["email", "Email address", "you@example.com", "email", true],
  ["phone", "Phone number", "+27 82 123 4567", "tel", true],
  ["location", "Professional location", "City or region", undefined, true],
  ["country", "Country", "South Africa", undefined, true],
  [
    "residentialSuburb",
    "Residential area / suburb",
    "Suburb or neighbourhood",
    undefined,
    true,
  ],
  [
    "residentialCity",
    "Residential city / town",
    "City or town",
    undefined,
    true,
  ],
  [
    "residentialProvince",
    "Province / region",
    "Province or region",
    undefined,
    true,
  ],
  ["residentialPostalCode", "Postal code", "Optional postal code"],
  ["linkedinUrl", "LinkedIn profile", "https://linkedin.com/in/you", "url"],
  ["portfolioUrl", "Portfolio website", "https://your-site.example", "url"],
];
export function ProfilePersonalDetailsForm({
  details,
  onChange,
}: {
  details: Details;
  onChange: (updated: Details) => void;
}) {
  const update = (key: keyof Details, value: string) =>
    onChange({ ...details, [key]: value || null });
  return (
    <section className="rounded-xl border border-border bg-card p-5 text-card-foreground shadow-sm sm:p-6">
      <div className="mb-5 space-y-1">
        <h2 className="text-base font-semibold">Personal details</h2>
        <p className="text-sm text-muted-foreground">
          Complete the required contact and location fields. Postal code and
          professional links are optional.
        </p>
      </div>
      <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
        {fields.map(([key, label, placeholder, type, required]) => (
          <div key={key} className="space-y-2">
            <label htmlFor={String(key)} className="text-sm font-medium">
              {label}{" "}
              <span className="font-normal text-muted-foreground">
                ({required ? "Required" : "Optional"})
              </span>
            </label>
            <Input
              id={String(key)}
              type={type || "text"}
              required={required}
              value={details[key] || ""}
              onChange={(event) => update(key, event.target.value)}
              placeholder={placeholder}
              autoComplete={
                key === "fullName"
                  ? "name"
                  : key === "email"
                    ? "email"
                    : key === "phone"
                      ? "tel"
                      : undefined
              }
            />
            {key === "residentialSuburb" && (
              <p className="text-xs text-muted-foreground">
                No street address or house number needed.
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
