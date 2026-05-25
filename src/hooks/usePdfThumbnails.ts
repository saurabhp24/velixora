import { useState, useEffect, useRef, useCallback } from "react";
import { useToast } from "./use-toast";

export interface PdfPageThumb {
  index: number;
  thumbnail: string | null;
}

export function usePdfThumbnails(file: File | null, scale = 1.2) {
  const [pages, setPages] = useState<PdfPageThumb[]>([]);
  const [isRendering, setIsRendering] = useState(false);
  const renderingRef = useRef(false);
  const { toast } = useToast();

  const renderThumbnails = useCallback(
    async (pdfFile: File) => {
      if (renderingRef.current) return;
      renderingRef.current = true;
      setIsRendering(true);
      setPages([]);

      try {
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/build/pdf.worker.min.mjs",
          import.meta.url
        ).toString();

        const arrayBuffer = await pdfFile.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const numPages = pdf.numPages;

        setPages(Array.from({ length: numPages }, (_, i) => ({ index: i, thumbnail: null })));

        for (let i = 0; i < numPages; i++) {
          const page = await pdf.getPage(i + 1);
          const viewport = page.getViewport({ scale });
          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext("2d")!;
          await page.render({ canvasContext: ctx, viewport }).promise;
          const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
          setPages((prev) =>
            prev.map((p, idx) => (idx === i ? { ...p, thumbnail: dataUrl } : p))
          );
        }
      } catch {
        toast({
          title: "Render error",
          description: "Could not render PDF pages. The file may be corrupted.",
          variant: "destructive",
        });
      } finally {
        setIsRendering(false);
        renderingRef.current = false;
      }
    },
    [toast, scale]
  );

  useEffect(() => {
    if (file) {
      renderThumbnails(file);
    } else {
      setPages([]);
      renderingRef.current = false;
    }
  }, [file, renderThumbnails]);

  const reset = useCallback(() => {
    setPages([]);
    renderingRef.current = false;
  }, []);

  return { pages, isRendering, reset };
}
