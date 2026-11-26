import type { UserProfileDto } from "../server/user-profile-schema";
import { licenceCategories } from "./profile-certification-options";

type Entry = UserProfileDto["certifications"][number];

export function ProfileCertificationLicense({
  value,
  onToggle,
}: {
  value: Entry;
  onToggle: (code: string, checked: boolean) => void;
}) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium">
        Licence codes printed on your South African licence
      </legend>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {licenceCategories.map((code) => (
          <label
            key={code}
            className="flex min-h-10 items-center gap-2 rounded-md border border-border px-3 text-sm"
          >
            <input
              type="checkbox"
              className="size-4 accent-primary"
              checked={(value.licenceCategories || []).includes(code)}
              onChange={(event) => onToggle(code, event.target.checked)}
            />
            Code {code}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
