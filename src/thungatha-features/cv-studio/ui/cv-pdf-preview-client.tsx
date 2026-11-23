"use client";

import { useEffect, useMemo, useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { Download, Minus, Plus, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CvPdfDocument, type CvPdfContent } from "./cv-pdf-document";

const MIN_ZOOM = 50;
const MAX_ZOOM = 200;
const ZOOM_STEP = 10;

export function CvPdfPreviewClient({ content, accent }: { content: CvPdfContent; accent?: string }) {
  const [zoom, setZoom] = useState(100);
  const [fitMode, setFitMode] = useState<"width" | "actual">("width");
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isPreparing, setIsPreparing] = useState(true);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const document = useMemo(() => <CvPdfDocument content={content} accent={accent} />, [content, accent]);
  const fileName = `${content.fullName.trim().replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "candidate"}-cv.pdf`;

  useEffect(() => {
    let active = true;
    let objectUrl: string | null = null;
    setIsPreparing(true);
    setPdfError(null);

    void pdf(document).toBlob().then((blob) => {
      if (!active) return;
      objectUrl = URL.createObjectURL(blob);
      setPdfUrl(objectUrl);
      setIsPreparing(false);
    }).catch((error: unknown) => {
      if (!active) return;
      setPdfError(error instanceof Error ? error.message : "The CV PDF could not be generated.");
      setIsPreparing(false);
    });

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [document]);

  const viewerUrl = pdfUrl
    ? `${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1&zoom=${fitMode === "width" ? "page-width" : zoom}`
    : undefined;

  function changeZoom(next: number) {
    setFitMode("actual");
    setZoom(Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, next)));
  }

  function downloadPdf() {
    if (!pdfUrl) return;
    const anchor = window.document.createElement("a");
    anchor.href = pdfUrl;
    anchor.download = fileName;
    anchor.click();
  }

  return (
    <section className="min-w-0 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-panel-2 p-3">
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="icon" aria-label="Zoom out" disabled={!pdfUrl || (fitMode === "actual" && zoom <= MIN_ZOOM)} onClick={() => changeZoom((fitMode === "width" ? 100 : zoom) - ZOOM_STEP)}>
            <Minus />
          </Button>
          <span className="min-w-14 text-center text-sm font-medium tabular-nums text-fg">{fitMode === "width" ? "Fit width" : `${zoom}%`}</span>
          <Button type="button" variant="outline" size="icon" aria-label="Zoom in" disabled={!pdfUrl || (fitMode === "actual" && zoom >= MAX_ZOOM)} onClick={() => changeZoom((fitMode === "width" ? 100 : zoom) + ZOOM_STEP)}>
            <Plus />
          </Button>
          <Button type="button" variant="ghost" size="icon" aria-label="Fit document to width" disabled={!pdfUrl} onClick={() => setFitMode("width")}>
            <RotateCcw />
          </Button>
          <Button type="button" variant="outline" size="sm" disabled={!pdfUrl} onClick={() => { setZoom(100); setFitMode("actual"); }}>100%</Button>
        </div>
        <Button type="button" onClick={downloadPdf} disabled={!pdfUrl}>
          <Download />
          {isPreparing ? "Preparing PDF…" : "Download PDF"}
        </Button>
      </div>

      {pdfError ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive" role="alert">{pdfError}</div>
      ) : (
        <div className="h-[min(78vh,1100px)] min-h-[620px] overflow-hidden rounded-xl border border-line bg-panel-2">
          {viewerUrl ? (
            <iframe key={viewerUrl} src={viewerUrl} title="A4 CV document preview" className="h-full w-full border-0" />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-fg-muted" aria-live="polite">Preparing A4 document…</div>
          )}
        </div>
      )}
    </section>
  );
}
