"use client";
import type { ReactNode } from "react";
import { JobCardButton } from "./job-card-button";
export type JobCardData = {
  id: string;
  title: string;
  employer_name: string | null;
  location_text: string | null;
  work_mode: string | null;
  employment_type: string | null;
};
type Props = {
  job: JobCardData;
  variant?: "public" | "authenticated";
  selected: boolean;
  postedLabel: string;
  onSelect: () => void;
  saveAction?: ReactNode;
};
export function JobOpportunityCard({
  job,
  selected,
  postedLabel,
  onSelect,
  saveAction,
}: Props) {
  return (
    <div className="relative w-full min-w-0">
      <JobCardButton
        job={job}
        selected={selected}
        postedLabel={postedLabel}
        onSelect={onSelect}
      />
      {saveAction && (
        <div className="th-job-card-actions absolute right-1.5 top-1/2 flex -translate-y-1/2 flex-col items-center gap-1">
          {saveAction}
        </div>
      )}
    </div>
  );
}
