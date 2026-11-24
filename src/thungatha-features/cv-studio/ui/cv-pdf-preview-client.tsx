"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { Download, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CvPdfDocument, type CvPdfContent } from "./cv-pdf-document";

export function CvPdfPreviewClient({
  content,
  accent,
  allowDownload = true,
}: {
  content: CvPdfContent;
  accent?: string;
  allowDownload?: boolean;
}) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isPreparing, setIsPreparing] = useState(true);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [renderedCanvases, setRenderedCanvases] = useState<HTMLCanvasElement[]>(
    [],
  );
  const [containerWidth, setContainerWidth] = useState(0);
  const viewerRef = useRef<HTMLDivElement>(null);
  const document = useMemo(
    () => <CvPdfDocument content={content} accent={accent} />,
    [content, accent],
  );
  const fileName = `${
    content.fullName
      .trim()
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/^-|-$/g, "") || "candidate"
  }-cv.pdf`;

  useEffect(() => {
    let active = true;
    let objectUrl: string | null = null;
    setIsPreparing(true);
    setPdfError(null);
    setPdfUrl(null);
    setPageCount(0);
    setRenderedCanvases([]);

    void pdf(document)
      .toBlob()
      .then((blob) => {
        if (!active) return;
        objectUrl = URL.createObjectURL(blob);
        setPdfUrl(objectUrl);
        setIsPreparing(false);
      })
      .catch((error: unknown) => {
        if (!active) return;
        setPdfError(
          error instanceof Error
            ? error.message
            : "The CV PDF could not be generated.",
        );
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

  useEffect(() => {
    if (!pdfUrl || !containerWidth) return;
    let active = true;
    let loadedDocument: {
      destroy: () => Promise<void>;
      numPages: number;
    } | null = null;
    setPdfError(null);
    setPageCount(0);
    setRenderedCanvases([]);

    void (async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/build/pdf.worker.min.mjs",
          import.meta.url,
        ).toString();
        const loadingTask = pdfjs.getDocument(pdfUrl);
        const pdfDocument = await loadingTask.promise;
        loadedDocument = pdfDocument;
        if (!active) return;
        setPageCount(pdfDocument.numPages);

        const firstPage = await pdfDocument.getPage(1);
        const baseWidth = firstPage.getViewport({ scale: 1 }).width;
        const fitScale = Math.max(0.25, containerWidth / baseWidth);
        const scale = fitScale;
        const canvases: HTMLCanvasElement[] = [];

        for (
          let pageNumber = 1;
          pageNumber <= pdfDocument.numPages;
          pageNumber += 1
        ) {
          const page = await pdfDocument.getPage(pageNumber);
          if (!active) return;
          const viewport = page.getViewport({ scale });
          const canvas = window.document.createElement("canvas");
          const context = canvas.getContext("2d");
          if (!context)
            throw new Error(
              "Your browser could not create the PDF preview canvas.",
            );
          const outputScale = window.devicePixelRatio || 1;
          canvas.width = Math.floor(viewport.width * outputScale);
          canvas.height = Math.floor(viewport.height * outputScale);
          canvas.style.width = `${viewport.width}px`;
          canvas.style.height = `${viewport.height}px`;
          canvas.className = "block h-auto max-w-full bg-white shadow-sm";
          context.setTransform(outputScale, 0, 0, outputScale, 0, 0);
          await page.render({ canvas, canvasContext: context, viewport }).promise;
          if (!active) return;
          canvases.push(canvas);
          setRenderedCanvases([...canvases]);
        }
      } catch (error) {
        if (active)
          setPdfError(
            error instanceof Error
              ? error.message
              : "The PDF preview could not be rendered.",
          );
      }
    })();

    return () => {
      active = false;
      if (loadedDocument) void loadedDocument.destroy();
    };
  }, [pdfUrl, containerWidth]);

  function downloadPdf() {
    if (!pdfUrl) return;
    const anchor = window.document.createElement("a");
    anchor.href = pdfUrl;
    anchor.download = fileName;
    anchor.click();
  }

  return (
    <section className="flex h-full min-h-0 min-w-0 flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-panel-2 p-3">
        <div className="flex min-w-0 items-center gap-2 text-sm font-medium text-fg-muted"><Maximize2 className="size-4" /><span>Fit width</span></div>
        <div className="flex w-full flex-wrap items-center justify-between gap-2 sm:w-auto sm:justify-end">
          {pageCount > 0 && (
            <span className="text-xs text-fg-muted">
              {pageCount} {pageCount === 1 ? "page" : "pages"}
            </span>
          )}
          {allowDownload && (
            <Button type="button" onClick={downloadPdf} disabled={!pdfUrl}>
              <Download />
              <span className="hidden sm:inline">
                {isPreparing ? "Preparing PDF…" : "Download PDF"}
              </span>
              <span className="sm:hidden">PDF</span>
            </Button>
          )}
        </div>
      </div>

      {pdfError ? (
        <div
          className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
          role="alert"
        >
          {pdfError}
        </div>
      ) : (
        <div
          ref={viewerRef}
          className="flex min-h-0 flex-1 flex-col items-center gap-0 overflow-auto rounded-xl border border-line bg-panel-2 p-2 sm:p-4"
          aria-label="CV document pages"
        >
          {isPreparing ? (
            <div className="flex h-full items-center justify-center text-sm text-fg-muted">
              Preparing A4 document…
            </div>
          ) : null}
          {renderedCanvases.map((canvas, index) => (
            <div key={index} className="flex w-full justify-center py-2">
              <CanvasPage canvas={canvas} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function CanvasPage({ canvas }: { canvas: HTMLCanvasElement }) {
  const hostRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    host.replaceChildren(canvas);
    return () => host.replaceChildren();
  }, [canvas]);
  return <div ref={hostRef} className="max-w-full" />;
}
