"use client";

import { useEffect, useRef } from "react";

export function CvPdfPageViewer({
  isPreparing, error, canvases, onWidthChange,
}: {
  isPreparing: boolean;
  error: string | null;
  canvases: HTMLCanvasElement[];
  onWidthChange: (width: number) => void;
}) {
  const viewerRef = useRef<HTMLDivElement>(null);

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
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive" role="alert">
        {error}
      </div>
    );
  }

  return (
    <div ref={viewerRef} className="flex min-h-0 flex-1 flex-col items-center gap-0 overflow-auto rounded-xl border border-line bg-panel-2 p-2 sm:p-4 [touch-action:pan-y_pinch-zoom]" aria-label="CV document pages">
      {isPreparing && (
        <div className="flex h-full items-center justify-center text-sm text-fg-muted">
          Preparing A4 document…
        </div>
      )}
      {canvases.map((canvas, index) => (
        <div key={index} className="flex w-full justify-center py-2">
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
  return <div ref={hostRef} className="max-w-full" />;
}
