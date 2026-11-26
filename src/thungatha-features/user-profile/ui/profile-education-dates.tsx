import { MonthYearPicker } from "@/components/ui/month-year-picker";
import type { UserProfileDto } from "../server/user-profile-schema";

type Education = UserProfileDto["education"][number];

export function ProfileEducationDates({
  value,
  schoolLevel,
  onChange,
}: {
  value: Education;
  schoolLevel: boolean;
  onChange: (key: keyof Education, next: string | boolean) => void;
}) {
  return (
    <>
      <div className={schoolLevel ? "" : "grid gap-4 sm:grid-cols-2"}>
        {!schoolLevel && (
          <label className="block space-y-2 text-sm font-medium">
            Start month/year
            <MonthYearPicker
              label="Start month and year"
              value={value.startDate || ""}
              onChange={(date) => onChange("startDate", date)}
              max={value.endDate || undefined}
            />
          </label>
        )}
        <label className="block space-y-2 text-sm font-medium">
          {schoolLevel
            ? "Completion month/year"
            : value.isCurrent
              ? "Expected completion month/year"
              : "End month/year"}
          <span className="text-destructive"> (Needed for completion)</span>
          <MonthYearPicker
            label="Completion month and year"
            value={value.endDate || ""}
            min={value.startDate || undefined}
            onChange={(date) => onChange("endDate", date)}
          />
        </label>
      </div>
      {!schoolLevel && (
        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            className="mt-0.5 size-4 accent-primary"
            checked={Boolean(value.isCurrent)}
            onChange={(event) => onChange("isCurrent", event.target.checked)}
          />
          I am currently studying here
        </label>
      )}
    </>
  );
}
