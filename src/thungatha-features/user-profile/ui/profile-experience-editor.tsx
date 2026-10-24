"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { UserProfileDto } from "../server/user-profile-schema";

type WorkExp = UserProfileDto["workExperience"][number];

export function ProfileExperienceEditor({
  items,
  onChange,
}: {
  items: WorkExp[];
  onChange: (items: WorkExp[]) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [employer, setEmployer] = useState("");

  const handleAdd = () => {
    if (!title || !employer) return;
    onChange([
      ...items,
      { id: `exp-${Date.now()}`, jobTitle: title, employer, startDate: "Present", isCurrent: true },
    ]);
    setTitle(""); setEmployer(""); setAdding(false);
  };

  return (
    <div className="rounded-xl border border-line bg-panel p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-fg">Work Experience</h2>
        <span className="text-xs text-fg-muted">{items.length} role{items.length === 1 ? "" : "s"}</span>
      </div>

      <div className="mt-3 divide-y divide-line/40">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between py-2 text-xs">
            <div>
              <p className="font-medium text-fg">{item.jobTitle} · {item.employer}</p>
              <p className="text-[11px] text-fg-muted">{item.startDate} – {item.endDate || "Present"}</p>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => {
                const jobTitle = window.prompt("Job title", item.jobTitle); if (jobTitle === null) return;
                const employer = window.prompt("Employer", item.employer); if (employer === null) return;
                const location = window.prompt("Location (optional)", item.location || ""); if (location === null) return;
                const startDate = window.prompt("Start date", item.startDate); if (startDate === null) return;
                const endDate = item.isCurrent ? null : window.prompt("End date (optional)", item.endDate || ""); if (endDate === null && !item.isCurrent) return;
                const description = window.prompt("Responsibilities and achievements (optional)", item.description || ""); if (description === null) return;
                onChange(items.map((entry) => entry.id === item.id ? { ...entry, jobTitle, employer, location: location || null, startDate, endDate: endDate || null, description: description || null } : entry));
              }} className="text-xs text-accent hover:underline">Edit</button>
              <button type="button" onClick={() => onChange(items.filter((i) => i.id !== item.id))} className="text-xs text-warn hover:underline">Remove</button>
            </div>
          </div>
        ))}
      </div>

      {adding ? (
        <div className="mt-3 rounded-lg bg-panel-2 p-3 space-y-2">
          <input
            placeholder="Job title (e.g. Frontend Engineer)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded border border-line bg-panel px-2.5 py-1.5 text-xs text-fg"
          />
          <input
            placeholder="Employer (e.g. Brightloop)"
            value={employer}
            onChange={(e) => setEmployer(e.target.value)}
            className="w-full rounded border border-line bg-panel px-2.5 py-1.5 text-xs text-fg"
          />
          <div className="flex gap-2">
            <Button type="button" size="xs" variant="primary" onClick={handleAdd}>Add role</Button>
            <Button type="button" size="xs" variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
          </div>
        </div>
      ) : (
        <Button type="button" size="xs" variant="outline" className="mt-3" onClick={() => setAdding(true)}>
          + Add experience
        </Button>
      )}
    </div>
  );
}
