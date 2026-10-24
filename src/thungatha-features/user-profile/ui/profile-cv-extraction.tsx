"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export type ExtractedCvFields = {
  fullName: string | null;
  email: string | null;
  phone: string | null;
  linkedinUrl: string | null;
  portfolioUrl: string | null;
  summary: string | null;
  skills: string[];
};
export function ProfileCvExtraction({
  filename,
  storagePath,
  onExtracted,
}: {
  filename: string;
  storagePath: string;
  onExtracted: (fields: ExtractedCvFields) => void;
}) {
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const [warnings, setWarnings] = useState<string[]>([]);
  async function extract() {
    setBusy(true);
    setError("");
    setWarnings([]);
    try {
      const response = await fetch("/api/profile/cv-extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename, storagePath }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "CV extraction failed.");
      const result = body.extraction as {
        status: string;
        fields: ExtractedCvFields;
        warnings: string[];
      };
      setWarnings(result.warnings || []);
      if (result.status === "failed") {
        setError("We couldn’t read enough information from this CV.");
        return;
      }
      onExtracted(result.fields);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "CV extraction failed. Please retry.",
      );
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    void extract();
    // Extract once whenever a newly uploaded file is staged.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filename, storagePath]);
  if (busy)
    return (
      <p
        role="status"
        className="mt-4 rounded-lg border border-line p-4 text-sm text-fg-muted"
      >
        Reading your CV and filling in the profile form…
      </p>
    );
  if (!error)
    return (
      <p role="status" className="mt-3 text-sm text-fg-muted">
        CV details are ready in the profile form. Review them before saving.
      </p>
    );
  return (
    <div className="mt-3 rounded-lg border border-warn/40 p-3">
      <p role="alert" className="text-sm text-warn">
        {error}
      </p>
      {warnings.map((warning) => (
        <p key={warning} className="mt-2 text-xs text-fg-muted">
          {warning}
        </p>
      ))}
      <Button className="mt-3" type="button" onClick={() => void extract()}>
        Retry extraction
      </Button>
    </div>
  );
}
