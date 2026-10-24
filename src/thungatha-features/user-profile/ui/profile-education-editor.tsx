"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { UserProfileDto } from "../server/user-profile-schema";

type Edu = UserProfileDto["education"][number];

export function ProfileEducationEditor({
  items,
  onChange,
}: {
  items: Edu[];
  onChange: (items: Edu[]) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [qual, setQual] = useState("");
  const [inst, setInst] = useState("");

  const handleAdd = () => {
    if (!qual.trim() || !inst.trim()) return;
    const fieldOfStudy = window.prompt("Field of study (optional)", "");
    if (fieldOfStudy === null) return;
    const startDate = window.prompt("Start date (optional)", "");
    if (startDate === null) return;
    const endDate = window.prompt("End/completion date (optional)", "");
    if (endDate === null) return;
    onChange([...items, { id: `edu-${Date.now()}`, qualification: qual.trim(), institution: inst.trim(), fieldOfStudy: fieldOfStudy || null, startDate: startDate || null, endDate: endDate || null }]);
    setQual(""); setInst(""); setAdding(false);
  };

  return (
    <div className="rounded-xl border border-line bg-panel p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-fg">Education</h2>
        <span className="text-xs text-fg-muted">{items.length}</span>
      </div>

      <div className="mt-3 divide-y divide-line/40">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between py-2 text-xs">
            <div>
              <p className="font-medium text-fg">{item.qualification}</p>
              <p className="text-[11px] text-fg-muted">{item.institution}</p>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => {
                const qualification = window.prompt("Qualification", item.qualification); if (qualification === null) return;
                const institution = window.prompt("Institution", item.institution); if (institution === null) return;
                const fieldOfStudy = window.prompt("Field of study (optional)", item.fieldOfStudy || ""); if (fieldOfStudy === null) return;
                const startDate = window.prompt("Start date (optional)", item.startDate || ""); if (startDate === null) return;
                const endDate = window.prompt("End/completion date (optional)", item.endDate || ""); if (endDate === null) return;
                onChange(items.map((entry) => entry.id === item.id ? { ...entry, qualification, institution, fieldOfStudy: fieldOfStudy || null, startDate: startDate || null, endDate: endDate || null } : entry));
              }} className="text-xs text-accent hover:underline">Edit</button>
              <button type="button" onClick={() => onChange(items.filter((i) => i.id !== item.id))} className="text-xs text-warn hover:underline">Remove</button>
            </div>
          </div>
        ))}
      </div>

      {adding ? (
        <div className="mt-3 rounded-lg bg-panel-2 p-3 space-y-2">
          <input
            placeholder="Qualification (e.g. BSc Computer Science)"
            value={qual}
            onChange={(e) => setQual(e.target.value)}
            className="w-full rounded border border-line bg-panel px-2.5 py-1.5 text-xs text-fg"
          />
          <input
            placeholder="Institution (e.g. Westbrook University)"
            value={inst}
            onChange={(e) => setInst(e.target.value)}
            className="w-full rounded border border-line bg-panel px-2.5 py-1.5 text-xs text-fg"
          />
          <div className="flex gap-2">
            <Button type="button" size="xs" variant="primary" onClick={handleAdd}>Add education</Button>
            <Button type="button" size="xs" variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
          </div>
        </div>
      ) : (
        <Button type="button" size="xs" variant="outline" className="mt-3" onClick={() => setAdding(true)}>
          + Add education
        </Button>
      )}
    </div>
  );
}
