import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import type { UserProfileDto } from "../server/user-profile-schema";
import { certificationTypes } from "./profile-certification-options";

type Entry = UserProfileDto["certifications"][number];

export function ProfileCertificationFields({
  value,
  driver,
  professional,
  needsIssuer,
  onSet,
  onSetType,
}: {
  value: Entry;
  driver: boolean;
  professional: boolean;
  needsIssuer: boolean;
  onSet: (key: keyof Entry, next: string | string[]) => void;
  onSetType: (type: string) => void;
}) {
  return (
    <>
      <label className="block space-y-2 text-sm font-medium">
        What are you adding? (Required)
        <NativeSelect
          required
          value={value.type || ""}
          onChange={(event) => onSetType(event.target.value)}
        >
          <option value="">Select an entry type</option>
          {certificationTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </NativeSelect>
      </label>
      {value.type && !driver && (
        <label className="block space-y-2 text-sm font-medium">
          {professional ? "Profession / registration type" : "Certificate name"}{" "}
          (Required)
          <Input
            required
            maxLength={150}
            value={value.name || ""}
            onChange={(event) => onSet("name", event.target.value)}
            placeholder={
              professional
                ? "e.g. Professional Engineer"
                : "e.g. Occupational Certificate: Electrician"
            }
          />
        </label>
      )}
      {needsIssuer && (
        <label className="block space-y-2 text-sm font-medium">
          {professional
            ? "Professional council / registration body"
            : "Issuing organisation"}{" "}
          (Required)
          <Input
            required
            maxLength={150}
            value={value.issuer || ""}
            onChange={(event) => onSet("issuer", event.target.value)}
            placeholder={
              professional
                ? "e.g. HPCSA, ECSA, SANC"
                : "Name of the issuing organisation"
            }
          />
        </label>
      )}
      {value.type === "other" && (
        <label className="block space-y-2 text-sm font-medium">
          Issuing organisation (Optional)
          <Input
            maxLength={150}
            value={value.issuer || ""}
            onChange={(event) => onSet("issuer", event.target.value)}
          />
        </label>
      )}
      {professional && (
        <label className="block space-y-2 text-sm font-medium">
          Registration number (Optional)
          <Input
            maxLength={100}
            value={value.licenceNumber || ""}
            onChange={(event) => onSet("licenceNumber", event.target.value)}
            placeholder="Your professional registration number"
          />
        </label>
      )}
    </>
  );
}
