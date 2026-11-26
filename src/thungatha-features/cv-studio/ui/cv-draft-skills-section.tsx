"use client";

import { useState, type FormEvent } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

type CvDraftSkillsSectionProps = {
  skills: string[];
  disabled: boolean;
  onAddSkill: (skill: string) => void;
};

export function CvDraftSkillsSection({
  skills,
  disabled,
  onAddSkill,
}: CvDraftSkillsSectionProps) {
  const [newSkill, setNewSkill] = useState("");

  function submitSkill(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = newSkill.trim();
    if (!value || skills.some((skill) => skill.toLowerCase() === value.toLowerCase())) return;
    onAddSkill(value);
    setNewSkill("");
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <form className="flex max-w-xl shrink-0 gap-2" onSubmit={submitSkill}>
        <input
          value={newSkill}
          onChange={(event) => setNewSkill(event.target.value)}
          maxLength={50}
          placeholder="Add a skill"
          aria-label="New skill"
          className="h-10 min-w-0 flex-1 rounded-lg border border-line bg-panel px-3 text-sm text-fg placeholder:text-fg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        />
        <Button type="submit" variant="outline" disabled={disabled || !newSkill.trim()}>
          <Plus className="mr-1 size-4" /> Add skill
        </Button>
      </form>
      <p className="shrink-0 text-xs text-fg-muted">
        Only add skills you genuinely have. Added skills update this draft and its PDF preview when saved.
      </p>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex flex-wrap content-start gap-2">
          {skills.map((skill, index) => (
            <span
              key={`${skill}-${index}`}
              className="rounded-full border border-accent/30 bg-accent-bg px-3 py-1.5 text-sm text-fg"
            >
              {skill}
            </span>
          ))}
          {!skills.length && <p className="text-sm text-fg-muted">No skills are currently listed.</p>}
        </div>
      </div>
    </div>
  );
}
