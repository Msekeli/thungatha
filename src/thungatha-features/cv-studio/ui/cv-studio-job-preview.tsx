import type { CvPdfContent } from "./cv-pdf-document";
import { CvPdfPreview } from "./cv-pdf-preview";
import { cvAccentHex } from "./cv-studio-content-types";
import type { CvContent, ReusableCv } from "./cv-studio-content-types";

export function CvStudioJobPreview({
  masterContent,
  reusableCv,
  tailoredPreview,
}: {
  masterContent: CvContent;
  reusableCv: ReusableCv | null;
  tailoredPreview: { content: CvPdfContent; accent: string } | null;
}) {
  return (
    <section className="flex min-h-0 min-w-0 flex-col rounded-2xl border border-line bg-panel p-2 text-fg shadow-sm sm:p-4 lg:h-full lg:overflow-y-auto">
      {reusableCv ? (
        <div className="min-h-0 flex-1 space-y-2">
          <p className="text-sm font-medium text-fg">
            Reusing accepted CV · Version {reusableCv.version_number}
          </p>
          <CvPdfPreview
            content={reusableCv.content}
            accent={cvAccentHex[reusableCv.accent_colour]}
          />
        </div>
      ) : (
        <CvPdfPreview
          content={tailoredPreview?.content ?? masterContent}
          accent={tailoredPreview?.accent}
        />
      )}
    </section>
  );
}
