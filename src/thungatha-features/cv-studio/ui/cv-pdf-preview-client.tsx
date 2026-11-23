"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { Download, Minus, Plus, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CvPdfDocument, type CvPdfContent } from "./cv-pdf-document";

const MIN_ZOOM = 50;
const MAX_ZOOM = 200;
const ZOOM_STEP = 10;

type PdfPageCanvas = { pageNumber: number; canvas: HTMLCanvasElement };

export function CvPdfPreviewClient({ content, accent }: { content: CvPdfContent; accent?: string }) {
  const [zoom, setZoom] = useState(100);
  const [fitMode, setFitMode] = useState<"width" | "actual">("width");
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isPreparing, setIsPreparing] = useState(true);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [renderedPages, setRenderedPages] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const viewerRef = useRef<HTMLDivElement>(null);
  const canvasRefs = useRef<PdfPageCanvas[]>([]);
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

  useEffect(() => {
    const element = viewerRef.current;
    if (!element) return;
    const observer = new ResizeObserver((entries) => {
      setContainerWidth(entries[0]?.contentRect.width ?? element.clientWidth);
    });
    observer.observe(element);
    setContainerWidth(element.clientWidth);
    return () => observer.disconnect();
  }, []);

  const renderPdfPages = useCallback(async () => {
    if (!pdfUrl || !containerWidth) return;
    let active = true;
    setPdfError(null);
    setRenderedPages(0);
    canvasRefs.current = [];

    try {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
      const loadingTask = pdfjs.getDocument(pdfUrl);
      const pdfDocument = await loadingTask.promise;
      if (!active) {
        await pdfDocument.destroy();
        return;
      }
      setPageCount(pdfDocument.numPages);

      const fitScale = Math.max(0.25, (containerWidth - 32) / (await pdfDocument.getPage(1)).getViewport({ scale: 1 }).width);
      const scale = fitMode === "width" ? fitScale : zoom / 100;

      for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber += 1) {
        const page = await pdfDocument.getPage(pageNumber);
        if (!active) break;
        const viewport = page.getViewport({ scale });
        const canvas = window.document.createElement("canvas");
        const context = canvas.getContext("2d");
        if (!context) throw new Error("Your browser could not create the PDF preview canvas.");
        const outputScale = window.devicePixelRatio || 1;
        canvas.width = Math.floor(viewport.width * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;
        canvas.className = "block h-auto max-w-full bg-white shadow-sm";
        context.setTransform(outputScale, 0, 0, outputScale, 0, 0);
        await page.render({ canvas, canvasContext: context, viewport }).promise;
        if (!active) break;
        canvasRefs.current.push({ pageNumber, canvas });
        setRenderedPages(pageNumber);
      }
      await pdfDocument.destroy();
    } catch (error) {
      if (active) setPdfError(error instanceof Error ? error.message : "The PDF preview could not be rendered.");
    }
    return () => { active = false; };
  }, [pdfUrl, containerWidth, fitMode, zoom]);

  useEffect(() => {
    let active = true;
    void renderPdfPages();
    return () => { active = false; };
  }, [renderPdfPages]);

  useEffect(() => {
    const target = viewerRef.current;
    if (!target || renderedPages === 0) return;
    target.replaceChildren(...canvasRefs.current.map(({ canvas }) => {
      const wrapper = window.document.createElement("div");
      wrapper.className = "flex w-full justify-center py-3";
      wrapper.append(canvas);
      return wrapper;
    }));
  }, [renderedPages]);

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
          <Button type="button" variant="outline" size="icon" aria-label="Zoom out" disabled={!pdfUrl || (fitMode === "actual" && zoom <= MIN_ZOOM)} onClick={() => changeZoom((fitMode === "width" ? 100 : zoom) - ZOOM_STEP)}><Minus /></Button>
          <span className="min-w-14 text-center text-sm font-medium tabular-nums text-fg">{fitMode === "width" ? "Fit width" : `${zoom}%`}</span>
          <Button type="button" variant="outline" size="icon" aria-label="Zoom in" disabled={!pdfUrl || (fitMode === "actual" && zoom >= MAX_ZOOM)} onClick={() => changeZoom((fitMode === "width" ? 100 : zoom) + ZOOM_STEP)}><Plus /></Button>
          <Button type="button" variant="ghost" size="icon" aria-label="Fit document to width" disabled={!pdfUrl} onClick={() => setFitMode("width")}><RotateCcw /></Button>
          <Button type="button" variant="outline" size="sm" disabled={!pdfUrl} onClick={() => { setZoom(100); setFitMode("actual"); }}>100%</Button>
        </div>
        <div className="flex items-center gap-3">
          {pageCount > 0 && <span className="text-xs text-fg-muted">{pageCount} {pageCount === 1 ? "page" : "pages"}</span>}
          <Button type="button" onClick={downloadPdf} disabled={!pdfUrl}><Download />{isPreparing ? "Preparing PDF…" : "Download PDF"}</Button>
        </div>
      </div>

      {pdfError ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive" role="alert">{pdfError}</div>
      ) : (
        <div className="h-[min(78vh,1100px)] min-h-[620px] overflow-auto rounded-xl border border-line bg-panel-2 p-4" aria-label="CV document pages">
          {isPreparing ? <div className="flex h-full items-center justify-center text-sm text-fg-muted">Preparing A4 document…</div> : null}
          <div ref={viewerRef} className="flex min-h-full flex-col items-center gap-0">
            {renderedPages > 0 && renderedPages < pageCount && <span className="py-2 text-xs text-fg-muted">Rendering page {renderedPages} of {pageCount}…</span>}
          </div>
        </div>
      )}
    </section>
  );
}
