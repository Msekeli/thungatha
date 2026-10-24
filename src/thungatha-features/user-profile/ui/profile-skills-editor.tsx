"use client";
import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
export function ProfileSkillsEditor({
  skills,
  onChange,
}: {
  skills: string[];
  onChange: (skills: string[]) => void;
}) {
  const [newSkill, setNewSkill] = useState("");
  const add = () => {
    const value = newSkill.trim();
    if (
      !value ||
      skills.some((skill) => skill.toLowerCase() === value.toLowerCase())
    )
      return;
    onChange([...skills, value]);
    setNewSkill("");
  };
  return (
    <section className="rounded-xl border border-border bg-card p-5 text-card-foreground shadow-sm sm:p-6">
      <div className="space-y-1">
        <h2 className="text-base font-semibold">Skills</h2>
        <p className="text-sm text-muted-foreground">
          Add the skills you want employers to find.
        </p>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {skills.map((skill) => (
          <span
            key={skill}
            className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary px-3 py-1.5 text-sm"
          >
            {skill}
            <button
              type="button"
              onClick={() => onChange(skills.filter((item) => item !== skill))}
              aria-label={`Remove ${skill}`}
              className="ml-1 rounded-full text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          </span>
        ))}
        {!skills.length && (
          <p className="text-sm text-muted-foreground">No skills added yet.</p>
        )}
      </div>
      <form
        className="mt-4 flex max-w-lg gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          add();
        }}
      >
        <Input
          value={newSkill}
          onChange={(event) => setNewSkill(event.target.value)}
          placeholder="e.g. React, SQL, project management"
          aria-label="Add a skill"
        />
        <Button type="submit" disabled={!newSkill.trim()}>
          <Plus className="size-4" /> Add
        </Button>
      </form>
    </section>
  );
}
