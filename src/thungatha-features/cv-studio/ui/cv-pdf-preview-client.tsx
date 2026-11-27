"use client";

import { useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { CvPdfDocument, type CvPdfContent } from "./cv-pdf-document";
import { useCvPdfBlob } from "./use-cv-pdf-blob";
import { useCvPdfPageRendering } from "./use-cv-pdf-page-rendering";
import { CvPdfPreviewControls } from "./cv-pdf-preview-controls";
import { CvPdfPageViewer } from "./cv-pdf-page-viewer";

export function CvPdfPreviewClient({
  content,
  accent,
  allowDownload = true,
}: {
  content: CvPdfContent;
  accent?: string;
  allowDownload?: boolean;
}) {
  const [containerWidth, setContainerWidth] = useState(0);
  const [zoomState, setZoomState] = useState({ content, accent, value: 100 });
  const zoom =
    zoomState.content === content && zoomState.accent === accent
      ? zoomState.value
      : 100;
  const setZoom: Dispatch<SetStateAction<number>> = (nextZoom) => {
    setZoomState((current) => {
      const currentZoom =
        current.content === content && current.accent === accent
          ? current.value
          : 100;
      return {
        content,
        accent,
        value:
          typeof nextZoom === "function" ? nextZoom(currentZoom) : nextZoom,
      };
    });
  };
  const document = useMemo(
    () => <CvPdfDocument content={content} accent={accent} />,
    [content, accent],
  );
  const {
    pdfUrl,
    isPreparing,
    error: generationError,
  } = useCvPdfBlob(document);
  const {
    pageCount,
    canvases,
    error: renderingError,
  } = useCvPdfPageRendering(pdfUrl, containerWidth, zoom);
  const pdfError = generationError ?? renderingError;
  const fileName = `${
    content.fullName
      .trim()
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/^-|-$/g, "") || "candidate"
  }-cv.pdf`;

  function downloadPdf() {
    if (!pdfUrl) return;
    const anchor = window.document.createElement("a");
    anchor.href = pdfUrl;
    anchor.download = fileName;
    anchor.click();
  }

  return (
    <section className="flex h-full min-h-0 min-w-0 flex-col gap-3">
      <CvPdfPreviewControls
        zoom={zoom}
        setZoom={setZoom}
        pageCount={pageCount}
        allowDownload={allowDownload}
        isPreparing={isPreparing}
        pdfUrl={pdfUrl}
        onDownload={downloadPdf}
      />
      <CvPdfPageViewer
        isPreparing={isPreparing}
        error={pdfError}
        canvases={canvases}
        zoom={zoom}
        setZoom={setZoom}
        onWidthChange={setContainerWidth}
      />
    </section>
  );
}
