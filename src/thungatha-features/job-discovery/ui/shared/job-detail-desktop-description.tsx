"use client";

import { useState } from "react";
import { JobDetailTabs } from "./job-detail-tabs";

const sections = [
  {
    value: "requirements",
    title: "Requirements",
    text: "Requirements will appear here when provided by the employer. Thungatha will not invent missing requirements.",
  },
  {
    value: "benefits",
    title: "Benefits",
    text: "Benefits have not been supplied in the available listing.",
  },
  {
    value: "company",
    title: "About the company",
    text: "Company information will appear here when an official employer source is available.",
  },
];

export function JobDetailDesktopDescription({
  description,
  descriptionIsPreview = false,
  largeText = false,
}: {
  description: string | null;
  descriptionIsPreview?: boolean;
  largeText?: boolean;
}) {
  const [activeTab, setActiveTab] = useState("description");
  const section = sections.find((item) => item.value === activeTab);

  return (
    <div className="th-job-description-panel hidden min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-lg border border-line bg-panel text-fg min-[601px]:flex">
      <JobDetailTabs
        tabs={[
          {
            label: descriptionIsPreview
              ? "Description preview"
              : "Job description",
            value: "description",
          },
          { label: "Requirements", value: "requirements" },
          { label: "Benefits", value: "benefits" },
          { label: "About the company", value: "company" },
        ]}
        value={activeTab}
        onChange={setActiveTab}
      />
      <div className="th-job-description-body min-h-0 min-w-0 flex-1 space-y-3 overflow-y-auto overscroll-contain p-4 text-[var(--th-fg)]">
        {activeTab === "description" ? (
          <>
            {descriptionIsPreview && (
              <p className="text-sm text-fg-muted">
                This source provides a preview. Open the original listing for
                the complete details when available.
              </p>
            )}
            <p
              className={`whitespace-pre-wrap text-[var(--th-fg)] ${largeText ? "text-modal-body" : "text-sm"}`}
            >
              {description ||
                "A full job description has not been supplied by the source. Open the employer's application page to review the role requirements before applying."}
            </p>
          </>
        ) : section ? (
          <section>
            <h3 className="mb-2 text-base font-bold text-fg">
              {section.title}
            </h3>
            <p className="text-sm leading-6 text-fg-muted">{section.text}</p>
          </section>
        ) : null}
      </div>
    </div>
  );
}
