"use client";

import { Button } from "@/components/ui/button";
import { CvPdfPreview } from "./cv-pdf-preview";
import type { CvPdfContent } from "./cv-pdf-document";

type SavedCvPreviewProps = {
  version: {
    content: CvPdfContent;
    accent_colour: "teal" | "navy" | "burgundy" | "forest";
  };
  onBack: () => void;
};

const accents = {
  teal: "#0F766E",
  navy: "#1D4ED8",
  burgundy: "#9F1239",
  forest: "#166534",
};

export function SavedCvPreview({ version, onBack }: SavedCvPreviewProps) {
  return (
    <div className="space-y-3">
      <Button size="sm" variant="outline" onClick={onBack}>
        Back to all CVs
      </Button>
      <CvPdfPreview
        content={version.content}
        accent={accents[version.accent_colour]}
      />
    </div>
  );
}
