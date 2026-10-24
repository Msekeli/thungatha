"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function ProfileSkillsEditor({
  skills,
  onChange,
}: {
  skills: string[];
  onChange: (skills: string[]) => void;
}) {
  const [newSkill, setNewSkill] = useState("");

  const handleAdd = () => {
    const trimmed = newSkill.trim();
    if (!trimmed || skills.includes(trimmed)) return;
    onChange([...skills, trimmed]);
    setNewSkill("");
  };

  return (
    <div className="rounded-xl border border-line bg-panel p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-fg">Skills</h2>
        <span className="text-xs text-fg-muted">{skills.length}</span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {skills.map((skill) => (
          <span
            key={skill}
            className="inline-flex items-center gap-1.5 rounded-lg bg-panel-2 px-2.5 py-1 text-xs text-fg"
          >
            <span>{skill}</span>
            <button
              type="button"
              onClick={() => onChange(skills.filter((s) => s !== skill))}
              className="text-fg-muted hover:text-warn"
              aria-label={`Remove skill ${skill}`}
            >
              ×
            </button>
          </span>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <input
          placeholder="Add skill (e.g. React)"
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAdd();
            }
          }}
          className="w-full max-w-xs rounded-lg border border-line bg-panel-2 px-3 py-1.5 text-xs text-fg outline-none focus:border-accent"
        />
        <Button type="button" size="xs" variant="secondary" onClick={handleAdd}>
          + Add skill
        </Button>
      </div>
    </div>
  );
}
