type RenderPdfPagesOptions = {
  pdfUrl: string;
  containerWidth: number;
  zoom: number;
  isActive: () => boolean;
  onPageCount: (count: number) => void;
  onPageRendered: (canvases: HTMLCanvasElement[]) => void;
};

export async function renderCvPdfPages({
  pdfUrl,
  containerWidth,
  zoom,
  isActive,
  onPageCount,
  onPageRendered,
}: RenderPdfPagesOptions) {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
  ).toString();
  const loadingTask = pdfjs.getDocument(pdfUrl);
  const pdfDocument = await loadingTask.promise;
  if (!isActive()) {
    await pdfDocument.destroy();
    return null;
  }

  try {
    onPageCount(pdfDocument.numPages);
    const firstPage = await pdfDocument.getPage(1);
    const baseWidth = firstPage.getViewport({ scale: 1 }).width;
    const fitScale = Math.max(0.25, containerWidth / baseWidth);
    const scale = fitScale * (zoom / 100);
    const rendered: HTMLCanvasElement[] = [];

    for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber += 1) {
      const page = await pdfDocument.getPage(pageNumber);
      if (!isActive()) {
        await pdfDocument.destroy();
        return null;
      }
      const viewport = page.getViewport({ scale });
      const canvas = window.document.createElement("canvas");
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Your browser could not create the PDF preview canvas.");
      const outputScale = window.devicePixelRatio || 1;
      canvas.width = Math.floor(viewport.width * outputScale);
      canvas.height = Math.floor(viewport.height * outputScale);
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;
      canvas.className = "block h-auto bg-white shadow-sm";
      context.setTransform(outputScale, 0, 0, outputScale, 0, 0);
      await page.render({ canvas, canvasContext: context, viewport }).promise;
      if (!isActive()) {
        await pdfDocument.destroy();
        return null;
      }
      rendered.push(canvas);
      onPageRendered([...rendered]);
    }
  } catch (cause) {
    await pdfDocument.destroy();
    throw cause;
  }

  return pdfDocument;
}
