"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type CvDraftEditorFooterProps = {
  activeIndex: number;
  busy: boolean;
  draftStatus: "draft" | "accepted" | null;
  onPrevious: () => void;
  onSave: () => void;
  onAccept: () => void;
  onNext: () => void;
};

export function CvDraftEditorFooter({
  activeIndex,
  busy,
  draftStatus,
  onPrevious,
  onSave,
  onAccept,
  onNext,
}: CvDraftEditorFooterProps) {
  return (
    <footer className="grid shrink-0 grid-cols-3 items-center gap-2 border-t border-line px-3 py-2 sm:flex sm:justify-between sm:gap-3 sm:px-6 sm:py-3">
      <Button
        type="button"
        size="sm"
        className="w-full px-2 text-xs sm:w-auto sm:px-3 sm:text-sm"
        variant="outline"
        disabled={activeIndex === 0}
        onClick={onPrevious}
      >
        <ArrowLeft className="mr-1 size-3.5 sm:size-4" />
        <span className="sm:hidden">Back</span>
        <span className="hidden sm:inline">Previous</span>
      </Button>
      {draftStatus === "draft" && (
        <Button
          type="button"
          size="sm"
          className="w-full px-2 text-xs sm:w-auto sm:px-3 sm:text-sm"
          variant="outline"
          disabled={busy}
          onClick={onSave}
        >
          {busy ? (
            "Saving…"
          ) : (
            <>
              <span className="sm:hidden">Save</span>
              <span className="hidden sm:inline">Save draft</span>
            </>
          )}
        </Button>
      )}
      {activeIndex === 3 ? (
        <Button
          type="button"
          disabled={busy || draftStatus !== "draft"}
          onClick={onAccept}
        >
          {busy ? "Saving…" : "Accept CV"}
        </Button>
      ) : (
        <Button
          type="button"
          size="sm"
          className="w-full px-2 text-xs sm:w-auto sm:px-3 sm:text-sm"
          onClick={onNext}
        >
          Next <ArrowRight className="ml-1 size-3.5 sm:size-4" />
        </Button>
      )}
    </footer>
  );
}
