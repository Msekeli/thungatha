import type { ReactNode } from "react";
export function ProfileSavedSectionCard({
  title,
  emptyMessage,
  children,
  count,
}: {
  title: string;
  emptyMessage?: string;
  children?: ReactNode;
  count?: number;
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-5 text-card-foreground shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">{title}</h2>
        {count !== undefined && (
          <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
            {count}
          </span>
        )}
      </div>
      <div className="mt-3 divide-y divide-border">
        {children || (
          <p className="text-sm text-muted-foreground">
            {emptyMessage || "None added yet."}
          </p>
        )}
      </div>
    </section>
  );
}
export function ProfileMasterCvCard({
  filename,
  fileSize,
  uploadedAt,
}: {
  filename?: string | null;
  fileSize?: number | null;
  uploadedAt?: string | null;
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-5 text-card-foreground shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Master CV</h2>
        <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
          {filename ? "Current" : "Not uploaded"}
        </span>
      </div>
      {filename ? (
        <div className="mt-3 rounded-lg border border-border bg-muted/40 p-3">
          <p className="text-sm font-medium">{filename}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {fileSize ? `${Math.round(fileSize / 1024)} KB` : ""}{" "}
            {uploadedAt
              ? `· Uploaded ${new Date(uploadedAt).toLocaleDateString()}`
              : ""}
          </p>
        </div>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">
          No CV uploaded yet.
        </p>
      )}
    </section>
  );
}
