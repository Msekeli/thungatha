"use client";

import { useState } from "react";
import { JobFilterDropdown } from "./job-filter-dropdown";
import {
  EMPLOYMENT_TYPE_OPTIONS,
  EXPERIENCE_OPTIONS,
  PUBLISHED_WITHIN_OPTIONS,
  WORK_MODE_OPTIONS,
} from "./job-filter-options";

type Props = {
  workMode: string | string[];
  onWorkModeChange: (value: string | string[]) => void;
  employmentType: string;
  onEmploymentTypeChange: (value: string) => void;
  publishedWithin?: string;
  onPublishedWithinChange?: (value: string) => void;
  experience?: string;
  onExperienceChange?: (value: string) => void;
};

export function JobFilterFields(props: Props) {
  const [expandedDropdown, setExpandedDropdown] = useState<string | null>(null);
  const toggle = (key: string) =>
    setExpandedDropdown((current) => (current === key ? null : key));
  const selectedModes = Array.isArray(props.workMode)
    ? props.workMode
    : props.workMode
      ? [props.workMode]
      : [];
  const multiMode = Array.isArray(props.workMode);
  const changeMode = (mode: string) =>
    props.onWorkModeChange(
      multiMode
        ? selectedModes.includes(mode)
          ? selectedModes.filter((item) => item !== mode)
          : [...selectedModes, mode]
        : selectedModes.includes(mode)
          ? ""
          : mode,
    );
  return (
    <div className="th-filter-content space-y-3">
      <fieldset className="th-filter-group space-y-1">
        <legend className="font-bold">Work arrangement</legend>
        {WORK_MODE_OPTIONS.map((item) => (
          <label key={item.value} className="flex min-h-8 items-center gap-2">
            <input
              type="checkbox"
              checked={selectedModes.includes(item.value)}
              onChange={() => changeMode(item.value)}
              className="size-4 accent-[var(--th-btn)]"
            />
            {item.label}
          </label>
        ))}
      </fieldset>
      <JobFilterDropdown
        label="Employment type"
        value={props.employmentType || "all"}
        options={EMPLOYMENT_TYPE_OPTIONS}
        onChange={props.onEmploymentTypeChange}
        open={expandedDropdown === "employmentType"}
        onToggle={() => toggle("employmentType")}
      />
      {props.publishedWithin !== undefined && props.onPublishedWithinChange && (
        <JobFilterDropdown
          label="Posted within"
          value={props.publishedWithin}
          options={PUBLISHED_WITHIN_OPTIONS}
          onChange={props.onPublishedWithinChange}
          open={expandedDropdown === "publishedWithin"}
          onToggle={() => toggle("publishedWithin")}
        />
      )}
      {props.experience !== undefined && props.onExperienceChange && (
        <JobFilterDropdown
          label="Experience level"
          value={props.experience}
          options={EXPERIENCE_OPTIONS}
          onChange={props.onExperienceChange}
          open={expandedDropdown === "experience"}
          onToggle={() => toggle("experience")}
        />
      )}
    </div>
  );
}
