"use client";

import { Download, Maximize2, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

type CvPdfPreviewControlsProps = {
  zoom: number;
  setZoom: (zoom: number | ((current: number) => number)) => void;
  pageCount: number;
  allowDownload: boolean;
  isPreparing: boolean;
  pdfUrl: string | null;
  onDownload: () => void;
};

export function CvPdfPreviewControls({
  zoom, setZoom, pageCount, allowDownload, isPreparing, pdfUrl, onDownload,
}: CvPdfPreviewControlsProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-panel-2 p-3">
      <div className="flex min-w-0 items-center gap-3">
        <button type="button" onClick={() => setZoom(100)} disabled={zoom === 100} className="flex items-center gap-2 text-sm font-medium text-fg-muted transition-colors hover:text-fg disabled:cursor-default disabled:opacity-60" aria-label="Fit page width">
          <Maximize2 className="size-4" /><span>Fit width</span>
        </button>
        <div className="flex items-center rounded-lg border border-line bg-panel">
          <button type="button" onClick={() => setZoom((value) => Math.max(50, value - 10))} disabled={zoom <= 50} className="rounded-l-lg p-2 text-fg-muted transition-colors hover:bg-panel-2 hover:text-fg disabled:opacity-40" aria-label="Zoom out">
            <Minus className="size-4" />
          </button>
          <span className="min-w-12 px-2 text-center text-xs font-semibold tabular-nums text-fg" aria-live="polite">{zoom}%</span>
          <button type="button" onClick={() => setZoom((value) => Math.min(200, value + 10))} disabled={zoom >= 200} className="rounded-r-lg p-2 text-fg-muted transition-colors hover:bg-panel-2 hover:text-fg disabled:opacity-40" aria-label="Zoom in">
            <Plus className="size-4" />
          </button>
        </div>
      </div>
      <div className="flex w-full flex-wrap items-center justify-between gap-2 sm:w-auto sm:justify-end">
        {pageCount > 0 && <span className="text-xs text-fg-muted">{pageCount} {pageCount === 1 ? "page" : "pages"}</span>}
        {allowDownload && (
          <Button type="button" onClick={onDownload} disabled={!pdfUrl}>
            <Download />
            <span className="hidden sm:inline">{isPreparing ? "Preparing PDF…" : "Download PDF"}</span>
            <span className="sm:hidden">PDF</span>
          </Button>
        )}
      </div>
    </div>
  );
}
