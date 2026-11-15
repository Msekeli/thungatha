"use client";

import "./job-detail-heading.css";
import { ExternalLink } from "lucide-react";
import type { ReactNode } from "react";

export function JobDetailHeading({
  title,
  employer,
  companyLogoUrl,
  action,
}: {
  title: string;
  employer: string | null;
  companyLogoUrl?: string | null;
  action?: ReactNode;
}) {
  const employerLabel = employer?.trim() || "Employer not listed";
  const initials = employerLabel
    .split(/\\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <div className="th-jobs-redesign-job-head">
      {companyLogoUrl ? (
        <img
          src={companyLogoUrl}
          alt=""
          className="th-jobs-employer-mark th-jobs-detail-logo bg-white object-contain p-1"
        />
      ) : (
        <div
          aria-hidden="true"
          className="th-jobs-employer-mark th-jobs-detail-logo"
        >
          {initials || "?"}
        </div>
      )}
      <div className="th-jobs-redesign-title">
        <h2>{title}</h2>
        <div className="th-jobs-employer-label">
          <span>{employerLabel}</span>
          <ExternalLink
            className="th-jobs-external-mark"
            size={13}
            aria-label="External employer link"
          />
        </div>
      </div>
      {action}
    </div>
  );
}
