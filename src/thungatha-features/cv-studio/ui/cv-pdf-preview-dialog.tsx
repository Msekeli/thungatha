"use client";

import { Dialog } from "@base-ui/react/dialog";
import { FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CvPdfPreview } from "./cv-pdf-preview";
import type { CvPdfContent } from "./cv-pdf-document";

export function CvPdfPreviewDialog({
  content,
  accent,
  allowDownload = true,
}: {
  content: CvPdfContent;
  accent?: string;
  allowDownload?: boolean;
}) {
  return (
    <Dialog.Root>
      <Dialog.Trigger
        render={
          <Button type="button" variant="outline" className="w-full sm:w-auto">
            <FileText aria-hidden="true" />
            Preview PDF
          </Button>
        }
      />
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-[1700] bg-black/60 backdrop-blur-sm" />
        <Dialog.Popup className="fixed inset-2 z-[1701] flex max-h-[calc(100dvh-1rem)] flex-col overflow-hidden rounded-xl border border-line bg-panel p-3 text-fg shadow-xl outline-none sm:inset-4 sm:p-4">
          <header className="flex shrink-0 items-center justify-between gap-3 border-b border-line pb-3">
            <Dialog.Title className="font-semibold">CV PDF preview</Dialog.Title>
            <Dialog.Close
              render={
                <Button type="button" variant="outline" size="sm">
                  <X aria-hidden="true" />
                  Close
                </Button>
              }
            />
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pt-3">
            <CvPdfPreview
              content={content}
              accent={accent}
              allowDownload={allowDownload}
            />
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
