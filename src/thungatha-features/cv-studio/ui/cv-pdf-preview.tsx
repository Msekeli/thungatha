"use client";

import dynamic from "next/dynamic";
import type { CvPdfContent } from "./cv-pdf-document";

const CvPdfPreviewClient = dynamic(
  () => import("./cv-pdf-preview-client").then((module) => module.CvPdfPreviewClient),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[620px] items-center justify-center rounded-xl border border-line bg-panel-2 text-sm text-fg-muted">
        Preparing A4 document preview…
      </div>
    ),
  },
);

export function CvPdfPreview({ content, accent }: { content: CvPdfContent; accent?: string }) {
  return <CvPdfPreviewClient content={content} accent={accent} />;
}
