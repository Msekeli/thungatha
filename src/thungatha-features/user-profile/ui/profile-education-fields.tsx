import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import type { UserProfileDto } from "../server/user-profile-schema";
import { educationFields, educationLevels } from "./profile-education-options";

type Education = UserProfileDto["education"][number];

export function ProfileEducationFields({
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
      <label className="block space-y-2 text-sm font-medium">
        Education level <span className="text-destructive">(Required)</span>
        <NativeSelect
          required
          value={value.educationLevel || ""}
          onChange={(event) => onChange("educationLevel", event.target.value)}
        >
          <option value="">Select education level</option>
          {educationLevels.map((level) => (
            <option key={level}>{level}</option>
          ))}
        </NativeSelect>
      </label>
      <label className="block space-y-2 text-sm font-medium">
        Qualification name <span className="text-destructive">(Required)</span>
        <Input
          required
          maxLength={150}
          value={value.qualification || ""}
          onChange={(event) => onChange("qualification", event.target.value)}
          placeholder={
            schoolLevel
              ? "e.g. National Senior Certificate (Matric)"
              : "e.g. Diploma in Software Development"
          }
        />
      </label>
      <label className="block space-y-2 text-sm font-medium">
        {schoolLevel ? "School name" : "Institution"}{" "}
        <span className="text-destructive">(Required)</span>
        <Input
          required
          maxLength={150}
          value={value.institution || ""}
          onChange={(event) => onChange("institution", event.target.value)}
          placeholder={
            schoolLevel
              ? "Enter the name of your school"
              : "College, university or institution"
          }
        />
      </label>
      {!schoolLevel && (
        <label className="block space-y-2 text-sm font-medium">
          Field of study{" "}
          <span className="font-normal text-muted-foreground">(Optional)</span>
          <Input
            list="education-fields"
            value={value.fieldOfStudy || ""}
            onChange={(event) => onChange("fieldOfStudy", event.target.value)}
            placeholder="Search or enter your own"
          />
          <datalist id="education-fields">
            {educationFields.map((field) => (
              <option key={field} value={field} />
            ))}
          </datalist>
        </label>
      )}
    </>
  );
}
