"use client";

import type { CvPdfContent } from "./cv-pdf-document";
import type { CvContent } from "./cv-studio-content-types";
import type { JobContext } from "./cv-studio-types";
import { CvDraftEditor } from "./cv-draft-editor";
import { CvStudioPreviewPanel } from "./cv-studio-preview-panel";

export function CvStudioTailoringWorkspace({
  masterVersionId,
  masterContent,
  jobContext,
  tailoredPreview,
  onContentChange,
}: {
  masterVersionId: string;
  masterContent: CvContent;
  jobContext: JobContext;
  tailoredPreview: { content: CvPdfContent; accent: string } | null;
  onContentChange: (content: CvPdfContent, accent: string) => void;
}) {
  return (
    <div className="grid h-full min-h-0 min-w-0 flex-1 grid-cols-1 gap-3 overflow-hidden lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-3">
      <div className="min-h-0 min-w-0">
        <CvDraftEditor
          masterVersionId={masterVersionId}
          onContentChange={onContentChange}
          jobContext={jobContext}
          initialContent={masterContent}
          startImmediately
        />
      </div>
      <section className="hidden min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl border border-line bg-panel p-3 text-fg shadow-sm lg:flex">
        <CvStudioPreviewPanel
          masterContent={masterContent}
          tailoredPreview={tailoredPreview}
        />
      </section>
    </div>
  );
}
