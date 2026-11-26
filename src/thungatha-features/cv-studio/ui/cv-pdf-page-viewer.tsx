"use client";

import { useEffect, useRef } from "react";
import { useCvPdfPinchZoom } from "./use-cv-pdf-pinch-zoom";

export function CvPdfPageViewer({
  isPreparing,
  error,
  canvases,
  zoom,
  setZoom,
  onWidthChange,
}: {
  isPreparing: boolean;
  error: string | null;
  canvases: HTMLCanvasElement[];
  zoom: number;
  setZoom: (zoom: number | ((current: number) => number)) => void;
  onWidthChange: (width: number) => void;
}) {
  const viewerRef = useRef<HTMLDivElement>(null);
  const pinchHandlers = useCvPdfPinchZoom(zoom, setZoom);

  useEffect(() => {
    const element = viewerRef.current;
    if (!element) return;
    const observer = new ResizeObserver((entries) => {
      onWidthChange(entries[0]?.contentRect.width ?? element.clientWidth);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [onWidthChange]);

  if (error) {
    return (
      <div
        className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
        role="alert"
      >
        {error}
      </div>
    );
  }

  return (
    <div
      ref={viewerRef}
      className="flex min-h-0 flex-1 flex-col items-start overflow-auto rounded-xl border border-line bg-panel-2 p-2 sm:p-4 [touch-action:pan-y]"
      aria-label="CV document pages"
      {...pinchHandlers}
    >
      {isPreparing && (
        <div className="flex h-full w-full items-center justify-center text-sm text-fg-muted">
          Preparing A4 document…
        </div>
      )}
      {canvases.map((canvas, index) => (
        <div key={index} className="flex w-max min-w-full justify-center py-2">
          <CanvasPage canvas={canvas} />
        </div>
      ))}
    </div>
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

  return <div ref={hostRef} className="w-max min-w-full" />;
}
