"use client";
import { Button } from "@/components/ui/button";
import {
  ProfileCvExtraction,
  type ExtractedCvFields,
} from "./profile-cv-extraction";
export type UploadedCv = {
  filename: string;
  fileSize: number;
  uploadedAt: string;
  storagePath: string;
  status: "staged";
};
export function ProfileCvStagedUpload({
  uploaded,
  hasCurrentCv,
  onExtracted,
  onChooseAnother,
}: {
  uploaded: UploadedCv;
  hasCurrentCv: boolean;
  onExtracted?: (fields: ExtractedCvFields) => void;
  onChooseAnother: () => void;
}) {
  return (
    <div className="mt-4 rounded-lg border border-border bg-muted/30 p-4">
      <p role="status" className="text-sm font-medium">
        CV uploaded: {uploaded.filename}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        The file is staged for import.{" "}
        {hasCurrentCv
          ? "Your current CV remains unchanged."
          : "It has not been set as your master CV."}{" "}
        Review extracted details before saving.
      </p>
      <ProfileCvExtraction
        filename={uploaded.filename}
        storagePath={uploaded.storagePath}
        onExtracted={onExtracted || (() => undefined)}
      />
      <Button className="mt-3" variant="outline" onClick={onChooseAnother}>
        Choose another file
      </Button>
    </div>
  );
}
