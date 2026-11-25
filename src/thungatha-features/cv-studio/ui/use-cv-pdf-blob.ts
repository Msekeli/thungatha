"use client";

import { useEffect, useState } from "react";
import { pdf } from "@react-pdf/renderer";
import type { ReactElement } from "react";

export function useCvPdfBlob(document: ReactElement) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isPreparing, setIsPreparing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let objectUrl: string | null = null;
    setIsPreparing(true);
    setError(null);
    setPdfUrl(null);

    void pdf(document).toBlob().then((blob) => {
      if (!active) return;
      objectUrl = URL.createObjectURL(blob);
      setPdfUrl(objectUrl);
      setIsPreparing(false);
    }).catch((cause: unknown) => {
      if (!active) return;
      setError(cause instanceof Error ? cause.message : "The CV PDF could not be generated.");
      setIsPreparing(false);
    });

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [document]);

  return { pdfUrl, isPreparing, error };
}
