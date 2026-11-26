"use client";

import { useEffect, useState } from "react";
import { pdf } from "@react-pdf/renderer";

type PdfDocumentElement = NonNullable<Parameters<typeof pdf>[0]>;

type PdfBlobState = {
  document: PdfDocumentElement;
  url: string | null;
  error: string | null;
};

export function useCvPdfBlob(document: PdfDocumentElement) {
  const [state, setState] = useState<PdfBlobState | null>(null);
  const current = state?.document === document ? state : null;
  const pdfUrl = current?.url ?? null;
  const isPreparing = !current;
  const error = current?.error ?? null;

  useEffect(() => {
    let active = true;
    let objectUrl: string | null = null;
    void pdf(document).toBlob().then((blob) => {
      if (!active) return;
      objectUrl = URL.createObjectURL(blob);
      setState({ document, url: objectUrl, error: null });
    }).catch((cause: unknown) => {
      if (!active) return;
      setState({
        document,
        url: null,
        error: cause instanceof Error ? cause.message : "The CV PDF could not be generated.",
      });
    });
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [document]);

  return { pdfUrl, isPreparing, error };
}
