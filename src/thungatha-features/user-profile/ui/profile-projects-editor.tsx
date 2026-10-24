"use client";
import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { UserProfileDto } from "../server/user-profile-schema";
type Project = UserProfileDto["projects"][number];
export function ProfileProjectsEditor({
  items,
  onChange,
}: {
  items: Project[];
  onChange: (items: Project[]) => void;
}) {
  const [name, setName] = useState("");
  const add = () => {
    if (!name.trim()) return;
    onChange([...items, { id: `project-${Date.now()}`, name: name.trim() }]);
    setName("");
  };
  return (
    <section className="w-full rounded-xl border border-border bg-card p-5 text-card-foreground shadow-sm sm:p-6">
      <h2 className="text-base font-semibold">Projects</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Optional section. The project name is required only when adding an
        entry.
      </p>
      <ul className="mt-3 divide-y divide-border">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between gap-2 py-2 text-sm"
          >
            <span className="min-w-0 break-words">{item.name}</span>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              aria-label={`Remove ${item.name}`}
              onClick={() =>
                onChange(items.filter((entry) => entry.id !== item.id))
              }
            >
              <X className="size-4" />
            </Button>
          </li>
        ))}
        {!items.length && (
          <li className="py-2 text-sm text-muted-foreground">
            No projects added yet.
          </li>
        )}
      </ul>
      <form
        className="mt-4 space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          add();
        }}
      >
        <label className="block space-y-2 text-sm font-medium">
          Project name{" "}
          <span className="font-normal text-destructive">
            (Required to add)
          </span>
          <Input
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Project name"
          />
        </label>
        <Button
          type="submit"
          className="w-full sm:w-auto"
          disabled={!name.trim()}
        >
          <Plus className="size-4" /> Add project
        </Button>
      </form>
    </section>
  );
}
