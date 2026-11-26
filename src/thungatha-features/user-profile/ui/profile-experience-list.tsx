import { Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { UserProfileDto } from "../server/user-profile-schema";
import { displayProfileMonth } from "./profile-date-utils";

type Experience = UserProfileDto["workExperience"][number];

export function ProfileExperienceList({
  items,
  onEdit,
  onRemove,
}: {
  items: Experience[];
  onEdit: (item: Experience) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Work experience</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Add each role separately, starting with your most recent.
          </p>
        </div>
        <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
          {items.length}
        </span>
      </div>
      <ul className="mt-4 divide-y divide-border">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-start justify-between gap-3 py-3 first:pt-0"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium">
                {item.jobTitle} · {item.employer}
              </p>
              <p className="text-sm text-muted-foreground">
                {displayProfileMonth(item.startDate)} –{" "}
                {item.isCurrent ? "Present" : displayProfileMonth(item.endDate)}
                {item.location ? ` · ${item.location}` : ""}
              </p>
              {item.description && (
                <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                  {item.description}
                </p>
              )}
            </div>
            <div className="flex shrink-0">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Edit ${item.jobTitle}`}
                onClick={() => onEdit(item)}
              >
                <Pencil className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Remove ${item.jobTitle}`}
                onClick={() => onRemove(item.id)}
              >
                <X className="size-4" />
              </Button>
            </div>
          </li>
        ))}
        {!items.length && (
          <li className="py-2 text-sm text-muted-foreground">
            No work experience added yet. This section is optional.
          </li>
        )}
      </ul>
    </>
  );
}
