"use client";
import { Input } from "@/components/ui/input";
import type { UserProfileDto } from "../server/user-profile-schema";
type Details = UserProfileDto["personalDetails"];
const fields: Array<[keyof Details, string, string, string?]> = [
  ["fullName", "Full name", "e.g. Lerato Naidoo"], ["email", "Email address", "you@example.com", "email"],
  ["phone", "Phone number", "+27 82 123 4567", "tel"], ["location", "Professional location", "City or region"],
  ["country", "Country", "South Africa"], ["residentialSuburb", "Residential area / suburb", "Suburb or neighbourhood"],
  ["residentialCity", "Residential city / town", "City or town"], ["residentialProvince", "Province / region", "Province or region"],
  ["residentialPostalCode", "Postal code", "Optional postal code"], ["linkedinUrl", "LinkedIn profile", "https://linkedin.com/in/you", "url"],
  ["portfolioUrl", "Portfolio website", "https://your-site.example", "url"],
];
export function ProfilePersonalDetailsForm({ details, onChange }: { details: Details; onChange: (updated: Details) => void }) {
  const update = (key: keyof Details, value: string) => onChange({ ...details, [key]: value || null });
  return <section className="rounded-xl border border-border bg-card p-5 text-card-foreground shadow-sm sm:p-6">
    <div className="mb-5 space-y-1"><h2 className="text-base font-semibold">Personal details</h2><p className="text-sm text-muted-foreground">Contact information and professional links.</p></div>
    <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">{fields.map(([key, label, placeholder, type]) => <div key={key} className="space-y-2">
      <label htmlFor={String(key)} className="text-sm font-medium">{label}</label>
      <Input id={String(key)} type={type || "text"} value={details[key] || ""} onChange={(event) => update(key, event.target.value)} placeholder={placeholder} autoComplete={key === "fullName" ? "name" : key === "email" ? "email" : key === "phone" ? "tel" : undefined} />
      {key === "residentialSuburb" && <p className="text-xs text-muted-foreground">No street address or house number needed.</p>}
    </div>)}</div>
  </section>;
}
