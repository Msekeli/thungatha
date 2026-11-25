import { CheckCircle2, Circle, CircleDashed } from "lucide-react";
import type { UserProfileDto } from "../server/user-profile-schema";
import {
  isEducationComplete,
  isPersonalDetailsComplete,
} from "./profile-completion-status";

export function ProfileCompletionChecklist({
  profile,
}: {
  profile: UserProfileDto;
}) {
  const items = [
    {
      label: "Personal details",
      done: isPersonalDetailsComplete(profile.personalDetails),
      required: true,
    },
    {
      label: "Professional summary",
      done: Boolean(profile.summary?.trim()),
      required: true,
    },
    {
      label: "Work experience",
      done: profile.workExperience.length > 0,
      required: false,
    },
    {
      label: "Education",
      done: isEducationComplete(profile.education),
      required: true,
    },
    { label: "Skills", done: profile.skills.length > 0, required: false },
    {
      label: "Certifications and licences",
      done: profile.certifications.length > 0,
      required: false,
    },
    { label: "Projects", done: profile.projects.length > 0, required: false },
    {
      label: "Preferred next role",
      done: Boolean(profile.nextRole?.trim()),
      required: false,
    },
    {
      label: "Interests and hobbies",
      done: profile.personalAttributes.length > 0,
      required: false,
    },
  ];

  return (
    <ul className="mt-4 grid gap-2.5">
      {items.map(({ label, done, required }) => (
        <li key={label} className="flex items-start gap-2 text-sm">
          {done ? (
            <CheckCircle2
              aria-label="Complete"
              className="mt-0.5 size-4 shrink-0 text-primary"
            />
          ) : required ? (
            <Circle
              aria-label="Required and incomplete"
              className="mt-0.5 size-4 shrink-0 text-muted-foreground"
            />
          ) : (
            <CircleDashed
              aria-label="Optional and not added"
              className="mt-0.5 size-4 shrink-0 text-muted-foreground"
            />
          )}
          <span className={done ? "text-foreground" : "text-muted-foreground"}>
            {label}
            <span className="ml-2 inline text-[10px] leading-tight text-muted-foreground max-[1400px]:ml-0 max-[1400px]:mt-px max-[1400px]:block">
              {done ? "Added" : required ? "Required" : "Optional"}
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}
