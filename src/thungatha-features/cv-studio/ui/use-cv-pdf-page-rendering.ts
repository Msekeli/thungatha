"use client";

import { useEffect, useState } from "react";
import { renderCvPdfPages } from "./cv-pdf-page-renderer";

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
  const current =
    state?.pdfUrl === pdfUrl &&
    state?.containerWidth === containerWidth &&
    state?.zoom === zoom
      ? state
      : null;

  useEffect(() => {
    if (!pdfUrl || !containerWidth) return;
    let active = true;
    let loadedDocument: { destroy: () => Promise<void> } | null = null;
    const onPageCount = (pageCount: number) => {
      setState({
        pdfUrl,
        containerWidth,
        zoom,
        pageCount,
        canvases: [],
        error: null,
      });
    };
    const onPageRendered = (canvases: HTMLCanvasElement[]) => {
      setState({
        pdfUrl,
        containerWidth,
        zoom,
        pageCount: canvases.length,
        canvases,
        error: null,
      });
    };

    void renderCvPdfPages({
      pdfUrl,
      containerWidth,
      zoom,
      isActive: () => active,
      onPageCount,
      onPageRendered,
    })
      .then((document) => {
        if (!active) {
          if (document) void document.destroy();
          return;
        }
        loadedDocument = document;
      })
      .catch((cause: unknown) => {
        if (active) {
          setState({
            pdfUrl,
            containerWidth,
            zoom,
            pageCount: 0,
            canvases: [],
            error:
              cause instanceof Error
                ? cause.message
                : "The PDF preview could not be rendered.",
          });
        }
      });

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
