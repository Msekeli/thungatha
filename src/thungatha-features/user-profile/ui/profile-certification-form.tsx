"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { MonthYearPicker } from "@/components/ui/month-year-picker";
import type { UserProfileDto } from "../server/user-profile-schema";
type Entry = UserProfileDto["certifications"][number];
const types = [
  { value: "professional-certification", label: "Professional certification" },
  { value: "occupational-certificate", label: "Occupational or trade certificate" },
  { value: "professional-licence", label: "Professional registration / licence" },
  { value: "drivers-licence", label: "South African driver's licence" },
  { value: "other", label: "Other certificate" },
];
const categories = ["A1", "A", "B", "C1", "C", "EB", "EC1", "EC"];
export function ProfileCertificationForm({ value, onChange, onSave, onCancel, editing }: {
  value: Entry; onChange: (value: Entry) => void; onSave: () => void;
  onCancel: () => void; editing: boolean;
}) {
  const driver = value.type === "drivers-licence";
  const professional = value.type === "professional-licence";
  const needsIssuer = value.type !== "drivers-licence" && value.type !== "other";
  const set = (key: keyof Entry, next: string | string[]) => {
    const fieldValue = key === "name" ? next : next || null;
    onChange({ ...value, [key]: fieldValue } as Entry);
  };
  const setType = (type: string) => onChange({
    ...value, type: type as Entry["type"],
    name: type === "drivers-licence" ? "South African driver's licence" : value.name,
    issuingCountry: type === "drivers-licence" ? "South Africa" : null,
    licenceCategories: type === "drivers-licence" ? value.licenceCategories || [] : [],
  });
  const toggleCategory = (code: string, checked: boolean) =>
    set("licenceCategories", checked ? [...(value.licenceCategories || []), code] :
      (value.licenceCategories || []).filter((item) => item !== code));
  return (
    <form className="mt-4 space-y-4 rounded-lg border border-border bg-muted/40 p-4"
      onSubmit={(event) => { event.preventDefault(); onSave(); }}>
      <label className="block space-y-2 text-sm font-medium">What are you adding? (Required)
        <NativeSelect required value={value.type || ""} onChange={(event) => setType(event.target.value)}>
          <option value="">Select an entry type</option>
          {types.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
        </NativeSelect>
      </label>
      {value.type && !driver && <label className="block space-y-2 text-sm font-medium">
        {professional ? "Profession / registration type" : "Certificate name"} (Required)
        <Input required maxLength={150} value={value.name || ""} onChange={(event) => set("name", event.target.value)}
          placeholder={professional ? "e.g. Professional Engineer" : "e.g. Occupational Certificate: Electrician"} />
      </label>}
      {driver && <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Licence codes printed on your South African licence</legend>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {categories.map((code) => <label key={code} className="flex min-h-10 items-center gap-2 rounded-md border border-border px-3 text-sm">
            <input type="checkbox" className="size-4 accent-primary" checked={(value.licenceCategories || []).includes(code)}
              onChange={(event) => toggleCategory(code, event.target.checked)} /> Code {code}
          </label>)}
        </div>
      </fieldset>}
      {needsIssuer && <label className="block space-y-2 text-sm font-medium">
        {professional ? "Professional council / registration body" : "Issuing organisation"} (Required)
        <Input required maxLength={150} value={value.issuer || ""} onChange={(event) => set("issuer", event.target.value)}
          placeholder={professional ? "e.g. HPCSA, ECSA, SANC" : "Name of the issuing organisation"} />
      </label>}
      {value.type === "other" && <label className="block space-y-2 text-sm font-medium">
        Issuing organisation (Optional)
        <Input maxLength={150} value={value.issuer || ""} onChange={(event) => set("issuer", event.target.value)} />
      </label>}
      {professional && <label className="block space-y-2 text-sm font-medium">
        Registration number (Optional)
        <Input maxLength={100} value={value.licenceNumber || ""} onChange={(event) => set("licenceNumber", event.target.value)}
          placeholder="Your professional registration number" />
      </label>}
      {value.type && <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-2 text-sm font-medium">Issue date (Optional)
          <MonthYearPicker label="Issue month and year" value={value.issueDate || ""} onChange={(date) => set("issueDate", date)} max={value.expiryDate || undefined} />
        </label>
        <label className="block space-y-2 text-sm font-medium">Expiry date (If applicable)
          <MonthYearPicker label="Expiry month and year" value={value.expiryDate || ""} min={value.issueDate || undefined} onChange={(date) => set("expiryDate", date)} />
        </label>
      </div>}
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button type="submit" disabled={!value.type || (driver ? false : !value.name?.trim()) ||
          (needsIssuer && !value.issuer?.trim())}>{driver ? "Save licence" : "Save certificate"}</Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}
