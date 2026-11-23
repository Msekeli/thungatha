"use client";

import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import { Download, FileText, Printer } from "lucide-react";
import { CvPdfDocument, type CvPdfContent } from "./cv-pdf-document";

export function CvPdfPreview({ content, accent }: { content: CvPdfContent; accent?: string }) {
  const fileName = `${content.fullName.trim().replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "candidate"}-cv.pdf`;

  return (
    <section className="min-w-0 overflow-hidden rounded-xl border border-line bg-panel-2">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-medium text-fg">
          <FileText size={17} aria-hidden="true" />
          <span>A4 document preview</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="hidden text-xs text-fg-muted sm:inline">Zoom, page navigation and print controls are in the PDF toolbar.</span>
          <PDFDownloadLink
            document={<CvPdfDocument content={content} accent={accent} />}
            fileName={fileName}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-line bg-accent-bg px-3 text-sm font-semibold text-accent-text hover:opacity-90"
          >
            {({ loading, error }) => (
              <>
                <Download size={15} aria-hidden="true" />
                {loading ? "Preparing PDF…" : error ? "Retry download" : "Download PDF"}
              </>
            )}
          </PDFDownloadLink>
        </div>
      </div>
      <div className="h-[min(78vh,1000px)] min-h-[620px] bg-[#525659]">
        <PDFViewer
          width="100%"
          height="100%"
          style={{ border: 0, backgroundColor: "#525659" }}
          aria-label="Paginated A4 CV PDF preview"
        >
          <CvPdfDocument content={content} accent={accent} />
        </PDFViewer>
      </div>
    </section>
  );
}
