"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { UserProfileDto } from "../server/user-profile-schema";

type WorkExp = UserProfileDto["workExperience"][number];

const fieldClass =
  "w-full min-w-0 rounded-md border border-line bg-panel px-3 py-2 text-sm text-fg outline-none transition focus-visible:ring-2 focus-visible:ring-ring";

function monthValue(value?: string | null) {
  if (!value || /not specified/i.test(value)) return "";
  const isoMonth = value.match(/^(\\d{4})-(\\d{2})$/);
  if (isoMonth) return value;
  const parsed = value.match(/^(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\\s+(\\d{4})$/i);
  if (!parsed) return "";
  const month = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"].indexOf(parsed[1].slice(0, 3).toLowerCase()) + 1;
  return `${parsed[2]}-${String(month).padStart(2, "0")}`;
}

function displayMonth(value?: string | null) {
  const normalized = monthValue(value);
  if (!normalized) return value && !/not specified/i.test(value) ? value : "Not specified";
  const [year, month] = normalized.split("-");
  return new Date(Number(year), Number(month) - 1).toLocaleDateString("en", {
    month: "short",
    year: "numeric",
  });
}

export function ProfileExperienceEditor({
  items,
  onChange,
}: {
  items: WorkExp[];
  onChange: (items: WorkExp[]) => void;
}) {
  const [title, setTitle] = useState("");
  const [employer, setEmployer] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isCurrent, setIsCurrent] = useState(false);
  const [description, setDescription] = useState("");

  const resetForm = () => {
    setTitle("");
    setEmployer("");
    setStartDate("");
    setEndDate("");
    setIsCurrent(false);
    setDescription("");
  };

  const add = () => {
    if (!title.trim() || !employer.trim() || !startDate || (!isCurrent && !endDate)) return;
    onChange([
      ...items,
      {
        id: `exp-${Date.now()}`,
        jobTitle: title.trim(),
        employer: employer.trim(),
        startDate,
        endDate: isCurrent ? null : endDate,
        isCurrent,
        description: description.trim() || null,
        achievements: [],
      },
    ]);
    resetForm();
  };

  return (
    <section className="rounded-xl border border-line bg-panel p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-fg">Work experience</h2>
        <span className="text-xs text-fg-muted">{items.length} role(s)</span>
      </div>

      <div className="mt-3 divide-y divide-line/40">
        {items.map((item) => (
          <div key={item.id} className="flex items-start justify-between gap-3 py-3 text-xs">
            <div className="min-w-0">
              <p className="font-medium text-fg">{item.jobTitle} · {item.employer}</p>
              <p className="text-fg-muted">
                {displayMonth(item.startDate)} – {item.isCurrent ? "Present" : displayMonth(item.endDate)}
              </p>
              {item.description && (
                <p className="mt-1 whitespace-pre-wrap text-fg-muted">{item.description}</p>
              )}
            </div>
            <Button
              type="button"
              size="xs"
              variant="ghost"
              className="shrink-0 text-warn"
              onClick={() => onChange(items.filter((entry) => entry.id !== item.id))}
            >
              Remove
            </Button>
          </div>
        ))}
      </div>

      <div className="mt-3 space-y-3 rounded-lg bg-panel-2 p-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1.5 text-xs font-medium text-fg">
            Job title
            <input aria-label="Job title" placeholder="e.g. Software Engineer" value={title} onChange={(e) => setTitle(e.target.value)} className={fieldClass} />
          </label>
          <label className="space-y-1.5 text-xs font-medium text-fg">
            Employer
            <input aria-label="Employer" placeholder="Company or organisation" value={employer} onChange={(e) => setEmployer(e.target.value)} className={fieldClass} />
          </label>
          <label className="space-y-1.5 text-xs font-medium text-fg">
            Start date (month and year)
            <input aria-label="Start date" type="month" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={fieldClass} required />
          </label>
          <label className="space-y-1.5 text-xs font-medium text-fg">
            End date (month and year)
            <input aria-label="End date" type="month" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={fieldClass} disabled={isCurrent} required={!isCurrent} />
          </label>
        </div>

        <label className="flex cursor-pointer items-center gap-2 text-sm text-fg">
          <input
            type="checkbox"
            checked={isCurrent}
            onChange={(e) => {
              setIsCurrent(e.target.checked);
              if (e.target.checked) setEndDate("");
            }}
            className="size-4 accent-current"
          />
          I currently work here
        </label>

        <label className="block space-y-1.5 text-xs font-medium text-fg">
          Responsibilities or description <span className="font-normal text-fg-muted">(optional)</span>
          <textarea aria-label="Responsibilities or description" placeholder="Briefly describe your responsibilities" value={description} onChange={(e) => setDescription(e.target.value)} className={fieldClass} rows={3} />
        </label>

        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={add}
          disabled={!title.trim() || !employer.trim() || !startDate || (!isCurrent && !endDate)}
        >
          Add experience
        </Button>
      </div>
    </section>
  );
}
