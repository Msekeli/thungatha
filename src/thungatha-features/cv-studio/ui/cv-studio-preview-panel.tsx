"use client";

import { useState } from "react";
import type { CvPdfContent } from "./cv-pdf-document";
import { CvPdfPreview } from "./cv-pdf-preview";
import { SavedCvGrid } from "./saved-cv-grid";

type PreviewTab = "preview" | "master" | "saved";
type CvStudioPreviewPanelProps = {
  masterContent: CvPdfContent;
  tailoredPreview: { content: CvPdfContent; accent: string } | null;
};

export function CvStudioPreviewPanel({
  masterContent,
  tailoredPreview,
}: CvStudioPreviewPanelProps) {
  const [activeTab, setActiveTab] = useState<PreviewTab>("preview");
  const tabs: { id: PreviewTab; label: string }[] = [
    { id: "preview", label: "CV Preview" },
    { id: "master", label: "Master CV" },
    { id: "saved", label: "My CVs" },
  ];

  return (
    <>
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-line pb-3">
        <div
          className="flex items-center gap-1 rounded-full bg-panel-2 p-1"
          role="tablist"
          aria-label="CV preview version"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-full px-3 py-2 text-xs font-semibold transition-colors ${activeTab === tab.id ? "bg-panel text-fg shadow-sm" : "text-fg-muted hover:text-fg"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>
      <div className="min-h-0 flex-1 overflow-auto pt-3">
        {activeTab === "saved" ? (
          <SavedCvGrid />
        ) : (
          <CvPdfPreview
            content={activeTab === "master" ? masterContent : (tailoredPreview?.content ?? masterContent)}
            accent={activeTab === "master" ? undefined : tailoredPreview?.accent}
          />
        )}
      </div>
    </>
  );
}
