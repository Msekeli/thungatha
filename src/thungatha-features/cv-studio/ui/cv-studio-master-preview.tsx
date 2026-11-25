import { CvPdfPreview } from "./cv-pdf-preview";
import type { CvContent } from "./cv-studio-content-types";

export function CvStudioMasterPreview({
  content,
}: {
  content: CvContent | null;
}) {
  return (
    <section className="hidden min-w-0 rounded-2xl border border-line bg-panel p-3 text-fg shadow-sm sm:p-4 lg:block">
      {content ? (
        <CvPdfPreview content={content} />
      ) : (
        <p className="text-sm text-fg-muted">Your master CV is being prepared.</p>
      )}
    </section>
  );
}
