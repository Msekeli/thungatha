import { MonthYearPicker } from "@/components/ui/month-year-picker";
import type { UserProfileDto } from "../server/user-profile-schema";

type Entry = UserProfileDto["certifications"][number];

export function ProfileCertificationDates({
  value,
  onChange,
}: {
  value: Entry;
  onChange: (key: keyof Entry, next: string | string[]) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="block space-y-2 text-sm font-medium">
        Issue date (Optional)
        <MonthYearPicker
          label="Issue month and year"
          value={value.issueDate || ""}
          onChange={(date) => onChange("issueDate", date)}
          max={value.expiryDate || undefined}
        />
      </label>
      <label className="block space-y-2 text-sm font-medium">
        Expiry date (If applicable)
        <MonthYearPicker
          label="Expiry month and year"
          value={value.expiryDate || ""}
          min={value.issueDate || undefined}
          onChange={(date) => onChange("expiryDate", date)}
        />
      </label>
    </div>
  );
}
