import type { CvPdfContent } from "./cv-pdf-document";
import { CvPdfPreview } from "./cv-pdf-preview";

export function CvDraftAcceptedView({
  content,
  accent,
}: {
  content: CvPdfContent;
  accent: string;
}) {
  return (
    <section className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl border border-line bg-panel p-3 text-fg shadow-sm sm:p-6 max-[700px]:h-auto max-[700px]:overflow-visible">
      <header className="shrink-0 border-b border-line pb-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-accent-text">
          CV Studio
        </p>
        <h2 className="mt-1 text-xl font-bold sm:text-2xl">Your CV is ready</h2>
        <p className="mt-2 text-sm text-fg-muted">
          Your tailored CV has been accepted and saved. Preview it below or
          download the PDF.
        </p>
        <p className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700">
          <span aria-hidden="true">✓</span> Accepted and saved
        </p>
      </header>
      <div className="min-h-[70dvh] flex-1 pt-4">
        <CvPdfPreview content={content} accent={accent} allowDownload />
      </div>
    </section>
  );
}
