"use client";

import { useState } from "react";
import type { CvPdfContent } from "./cv-pdf-document";
import type { CvContent } from "./cv-studio-content-types";
import type { JobContext } from "./cv-studio-types";
import { CvDraftEditor } from "./cv-draft-editor";
import { CvStudioPreviewPanel } from "./cv-studio-preview-panel";

export function CvStudioTailoringWorkspace({
  masterVersionId, masterContent, jobContext, tailoredPreview, onContentChange,
}: {
  masterVersionId: string;
  masterContent: CvContent;
  jobContext: JobContext;
  tailoredPreview: { content: CvPdfContent; accent: string } | null;
  onContentChange: (content: CvPdfContent, accent: string) => void;
}) {
  const [mobileTab, setMobileTab] = useState<"edit" | "preview">("edit");

  return (
    <>
      <nav className="mb-3 grid grid-cols-2 gap-2 rounded-xl bg-panel-2 p-1 lg:hidden" aria-label="CV editor panels">
        <button type="button" role="tab" aria-selected={mobileTab === "edit"} onClick={() => setMobileTab("edit")} className={mobileTab === "edit" ? "rounded-lg bg-panel px-3 py-2 text-sm font-semibold text-fg shadow-sm" : "rounded-lg px-3 py-2 text-sm text-fg-muted"}>Edit CV</button>
        <button type="button" role="tab" aria-selected={mobileTab === "preview"} onClick={() => setMobileTab("preview")} className={mobileTab === "preview" ? "rounded-lg bg-panel px-3 py-2 text-sm font-semibold text-fg shadow-sm" : "rounded-lg px-3 py-2 text-sm text-fg-muted"}>Preview CV</button>
      </nav>
      <div className="grid h-full min-h-0 min-w-0 flex-1 grid-cols-1 gap-3 overflow-hidden lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-3">
        <div className={mobileTab === "edit" ? "min-h-0 min-w-0" : "hidden min-h-0 min-w-0 lg:block"}>
          <CvDraftEditor
            masterVersionId={masterVersionId}
            onContentChange={onContentChange}
            jobContext={jobContext}
            initialContent={masterContent}
            startImmediately
          />
        </div>
        <section className={mobileTab === "preview" ? "flex min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl border border-line bg-panel p-2 text-fg shadow-sm sm:p-3 lg:p-3" : "hidden min-h-0 min-w-0 lg:flex lg:flex-col lg:overflow-hidden lg:rounded-2xl lg:border lg:border-line lg:bg-panel lg:p-3 lg:text-fg lg:shadow-sm"}>
          <CvStudioPreviewPanel
            masterContent={masterContent}
            tailoredPreview={tailoredPreview}
          />
        </section>
      </div>
    </>
  );
}
