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
    <div className="rounded-xl border border-line bg-panel p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-fg-muted">
          {title}
        </h2>
        {count !== undefined && count > 0 && (
          <span className="text-xs text-fg-muted">{count}</span>
        )}
      </div>

      <div className="mt-3 divide-y divide-line/40">
        {children ? (
          children
        ) : (
          <p className="text-xs text-fg-muted">
            {emptyMessage || "None added yet."}
          </p>
        )}
      </div>
    </div>
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
    <div className="rounded-xl border border-line bg-panel p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-fg-muted">
          Master CV
        </h2>
        <span className="rounded bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
          {filename ? "Current" : "Not uploaded"}
        </span>
      </div>

      {filename ? (
        <div className="mt-3 flex items-center justify-between rounded-lg bg-panel-2 p-3">
          <div>
            <p className="text-xs font-medium text-fg">{filename}</p>
            <p className="mt-0.5 text-[11px] text-fg-muted">
              {fileSize ? `${Math.round(fileSize / 1024)} KB` : ""}{" "}
              {uploadedAt
                ? `· Uploaded ${new Date(uploadedAt).toLocaleDateString()}`
                : ""}
            </p>
          </div>
        </div>
      ) : (
        <p className="mt-3 text-xs text-fg-muted">
          No CV file uploaded yet. CV upload and private storage will be enabled
          in milestone C03.
        </p>
      )}
    </div>
  );
}
