"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { UserProfileDto } from "../server/user-profile-schema";

type WorkExp = UserProfileDto["workExperience"][number];

export function ProfileExperienceEditor({ items, onChange }: {
  items: WorkExp[]; onChange: (items: WorkExp[]) => void;
}) {
  const [title, setTitle] = useState("");
  const [employer, setEmployer] = useState("");
  const [description, setDescription] = useState("");
  const [achievements, setAchievements] = useState("");
  const add = () => {
    if (!title.trim() || !employer.trim()) return;
    onChange([...items, { id: `exp-${Date.now()}`, jobTitle: title.trim(), employer: employer.trim(),
      startDate: "Not specified", isCurrent: false, description: description.trim() || null,
      achievements: achievements.split("\n").map((item) => item.trim()).filter(Boolean) }]);
    setTitle(""); setEmployer(""); setDescription(""); setAchievements("");
  };
  return <section className="rounded-xl border border-line bg-panel p-5">
    <div className="flex items-center justify-between"><h2 className="text-sm font-semibold text-fg">Work experience</h2><span className="text-xs text-fg-muted">{items.length} role(s)</span></div>
    <div className="mt-3 divide-y divide-line/40">{items.map((item) => <div key={item.id} className="flex items-start justify-between gap-3 py-3 text-xs">
      <div className="min-w-0"><p className="font-medium text-fg">{item.jobTitle} · {item.employer}</p><p className="text-fg-muted">{item.startDate} – {item.isCurrent ? "Present" : item.endDate || "Not specified"}</p>
        {item.description && <p className="mt-1 whitespace-pre-wrap text-fg-muted">{item.description}</p>}
        {item.achievements?.map((achievement) => <p key={achievement} className="mt-1 text-fg-muted">• {achievement}</p>)}
      </div>
      <button type="button" onClick={() => onChange(items.filter((entry) => entry.id !== item.id))} className="shrink-0 text-xs text-warn hover:underline">Remove</button>
    </div>)}</div>
    <div className="mt-3 space-y-2 rounded-lg bg-panel-2 p-3">
      <input aria-label="Job title" placeholder="Job title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded border border-line bg-panel px-3 py-2 text-sm text-fg" />
      <input aria-label="Employer" placeholder="Employer / organisation" value={employer} onChange={(e) => setEmployer(e.target.value)} className="w-full rounded border border-line bg-panel px-3 py-2 text-sm text-fg" />
      <textarea aria-label="Responsibilities or description" placeholder="Responsibilities or description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full rounded border border-line bg-panel px-3 py-2 text-sm text-fg" rows={2} />
      <textarea aria-label="Achievements" placeholder="Achievements — one per line (optional)" value={achievements} onChange={(e) => setAchievements(e.target.value)} className="w-full rounded border border-line bg-panel px-3 py-2 text-sm text-fg" rows={2} />
      <Button type="button" size="sm" variant="secondary" onClick={add} disabled={!title.trim() || !employer.trim()}>Add experience</Button>
    </div>
  </section>;
}
