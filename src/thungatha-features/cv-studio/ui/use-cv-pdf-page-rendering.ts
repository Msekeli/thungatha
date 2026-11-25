"use client";

import { useEffect, useState } from "react";

type PdfRenderState = {
  pdfUrl: string;
  containerWidth: number;
  zoom: number;
  pageCount: number;
  canvases: HTMLCanvasElement[];
  error: string | null;
};

export function useCvPdfPageRendering(
  pdfUrl: string | null,
  containerWidth: number,
  zoom: number,
) {
  const [state, setState] = useState<PdfRenderState | null>(null);
  const current = state?.pdfUrl === pdfUrl &&
    state?.containerWidth === containerWidth &&
    state?.zoom === zoom ? state : null;

  useEffect(() => {
    if (!pdfUrl || !containerWidth) return;
    let active = true;
    let loadedDocument: { destroy: () => Promise<void>; numPages: number } | null = null;

    void (async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url,
        ).toString();
        const loadingTask = pdfjs.getDocument(pdfUrl);
        const pdfDocument = await loadingTask.promise;
        loadedDocument = pdfDocument;
        if (!active) return;
        setState({
          pdfUrl, containerWidth, zoom,
          pageCount: pdfDocument.numPages, canvases: [], error: null,
        });

        const firstPage = await pdfDocument.getPage(1);
        const baseWidth = firstPage.getViewport({ scale: 1 }).width;
        const fitScale = Math.max(0.25, containerWidth / baseWidth);
        const scale = fitScale * (zoom / 100);
        const rendered: HTMLCanvasElement[] = [];

        for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber += 1) {
          const page = await pdfDocument.getPage(pageNumber);
          if (!active) return;
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
          if (!active) return;
          rendered.push(canvas);
          setState({
            pdfUrl, containerWidth, zoom,
            pageCount: pdfDocument.numPages, canvases: [...rendered], error: null,
          });
        }
      } catch (cause) {
        if (active) {
          setState({
            pdfUrl, containerWidth, zoom, pageCount: 0, canvases: [],
            error: cause instanceof Error ? cause.message : "The PDF preview could not be rendered.",
          });
        }
      }
    })();

    return () => {
      active = false;
      if (loadedDocument) void loadedDocument.destroy();
    };
  }, [pdfUrl, containerWidth, zoom]);

  return {
    pageCount: current?.pageCount ?? 0,
    canvases: current?.canvases ?? [],
    error: current?.error ?? null,
  };
}
