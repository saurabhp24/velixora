import { useState, useEffect, useRef, useCallback } from "react";
import { useFileContext } from "../../contexts/FileContext";
import { getToolByHref } from "../../lib/tools";
import { ToolPageLayout } from "../../components/tools/ToolPageLayout";
import { UploadZone } from "../../components/tools/UploadZone";
import { ProcessButton } from "../../components/tools/ProcessButton";
import { DownloadResult } from "../../components/tools/DownloadResult";
import { saveAs } from "file-saver";
import { useToast } from "../../hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Loader2, CheckSquare, Square, Info } from "lucide-react";
import { cn } from "../../lib/utils";

interface PageItem {
  id: string;
  index: number;
  thumbnail: string | null;
  selected: boolean;
}

function PageThumbnail({
  page,
  onToggle,
  isLoading,
  accent,
}: {
  page: PageItem;
  onToggle: (id: string) => void;
  isLoading: boolean;
  accent: string;
}) {
  return (
    <motion.button
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      onClick={() => onToggle(page.id)}
      className={cn(
        "relative group rounded-xl border-2 overflow-hidden cursor-pointer transition-all duration-200 focus:outline-none",
        page.selected
          ? "border-red-500/80 shadow-[0_0_20px_rgba(239,68,68,0.3)]"
          : "border-white/10 hover:border-white/25"
      )}
      data-testid={`page-thumb-${page.id}`}
      title={`Page ${page.index + 1} — click to ${page.selected ? "keep" : "mark for deletion"}`}
    >
      {/* Selected overlay */}
      <AnimatePresence>
        {page.selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 bg-red-500/20 flex items-center justify-center"
          >
            <div className="bg-red-500 rounded-full p-2 shadow-lg shadow-red-500/40">
              <Trash2 className="w-5 h-5 text-white" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Checkbox badge */}
      <div
        className={cn(
          "absolute top-2 right-2 z-20 transition-opacity duration-150",
          page.selected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )}
      >
        {page.selected ? (
          <CheckSquare className="w-5 h-5 text-red-400 drop-shadow" />
        ) : (
          <Square className="w-5 h-5 text-white/60 drop-shadow" />
        )}
      </div>

      {/* Thumbnail image */}
      <div
        className={cn(
          "w-full aspect-[3/4] bg-white/3 flex items-center justify-center overflow-hidden transition-all duration-200",
          page.selected ? "opacity-60" : ""
        )}
      >
        {isLoading || !page.thumbnail ? (
          <div className="flex flex-col items-center gap-2 text-white/30">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : (
          <img
            src={page.thumbnail}
            alt={`Page ${page.index + 1}`}
            className="w-full h-full object-contain"
            draggable={false}
          />
        )}
      </div>

      {/* Page label */}
      <div
        className={cn(
          "px-2 py-1.5 text-center transition-colors duration-200",
          page.selected ? "bg-red-950/60" : "bg-white/3"
        )}
      >
        <span
          className={cn(
            "text-xs font-semibold",
            page.selected ? "text-red-400" : "text-white/50"
          )}
        >
          {page.selected ? "Delete" : `Page ${page.index + 1}`}
        </span>
      </div>
    </motion.button>
  );
}

export default function DeletePages() {
  const tool = getToolByHref("/tools/delete-pages")!;
  const { pendingFiles, clearPendingFiles } = useFileContext();
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [isRendering, setIsRendering] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; name: string } | null>(null);
  const { toast } = useToast();
  const renderingRef = useRef(false);

  useEffect(() => {
    if (pendingFiles.length > 0) {
      setFile(pendingFiles[0]);
      clearPendingFiles();
    }
  }, [pendingFiles, clearPendingFiles]);

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

        // Seed the grid immediately so skeletons show
        setPages(
          Array.from({ length: numPages }, (_, i) => ({
            id: `page-${i}`,
            index: i,
            thumbnail: null,
            selected: false,
          }))
        );

        for (let i = 0; i < numPages; i++) {
          const page = await pdf.getPage(i + 1);
          const viewport = page.getViewport({ scale: 1.2 });
          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext("2d")!;
          await page.render({ canvas, canvasContext: ctx, viewport }).promise;
          const dataUrl = canvas.toDataURL("image/jpeg", 0.7);

          setPages((prev) =>
            prev.map((p) =>
              p.id === `page-${i}` ? { ...p, thumbnail: dataUrl } : p
            )
          );
        }
      } catch (err) {
        console.error(err);
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
    [toast]
  );

  useEffect(() => {
    if (file) renderThumbnails(file);
  }, [file, renderThumbnails]);

  const handleFilesAccepted = (newFiles: File[]) => {
    setFile(newFiles[0]);
    setResult(null);
  };

  const handleToggle = (id: string) => {
    setPages((prev) =>
      prev.map((p) => (p.id === id ? { ...p, selected: !p.selected } : p))
    );
  };

  const handleSelectAll = () => {
    setPages((prev) => prev.map((p) => ({ ...p, selected: true })));
  };

  const handleDeselectAll = () => {
    setPages((prev) => prev.map((p) => ({ ...p, selected: false })));
  };

  const selectedCount = pages.filter((p) => p.selected).length;
  const remainingCount = pages.length - selectedCount;

  const handleProcess = async () => {
    if (!file || selectedCount === 0) return;
    if (remainingCount === 0) {
      toast({
        title: "Cannot delete all pages",
        description: "At least one page must remain in the PDF.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const arrayBuffer = await file.arrayBuffer();
      const sourcePdf = await PDFDocument.load(arrayBuffer);
      const newPdf = await PDFDocument.create();

      // Copy only the pages that are NOT selected for deletion
      const keepIndices = pages
        .filter((p) => !p.selected)
        .map((p) => p.index);

      const copiedPages = await newPdf.copyPages(sourcePdf, keepIndices);
      copiedPages.forEach((page) => newPdf.addPage(page));

      const bytes = await newPdf.save();
      const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
      setResult({
        blob,
        name: file.name.replace(".pdf", "-pages-deleted.pdf"),
      });
      toast({
        title: "Done!",
        description: `${selectedCount} page${selectedCount !== 1 ? "s" : ""} deleted. ${remainingCount} page${remainingCount !== 1 ? "s" : ""} remain.`,
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Processing failed",
        description: "Could not delete pages. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPages([]);
    setResult(null);
    renderingRef.current = false;
  };

  return (
    <ToolPageLayout tool={tool}>
      <AnimatePresence mode="wait">
        {result ? (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <DownloadResult
              onDownload={() => saveAs(result.blob, result.name)}
              onReset={handleReset}
              filename={result.name}
              size={result.blob.size}
            />
          </motion.div>
        ) : !file ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <UploadZone
              tool={tool}
              onFilesAccepted={handleFilesAccepted}
              maxFiles={1}
            />
          </motion.div>
        ) : (
          <motion.div
            key="editor"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {/* Header bar */}
            <div className="flex items-center justify-between mb-5 px-1">
              <div>
                <p className="text-sm font-medium text-foreground/80">
                  {file.name}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isRendering
                    ? "Rendering page thumbnails..."
                    : `${pages.length} pages — click to mark for deletion`}
                </p>
              </div>
              <button
                onClick={handleReset}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
                data-testid="change-file-btn"
              >
                Change file
              </button>
            </div>

            {/* Info + bulk actions bar */}
            <div
              className="flex items-center justify-between mb-5 px-4 py-3 rounded-xl text-sm"
              style={{
                background: "rgba(239,68,68,0.07)",
                border: "1px solid rgba(239,68,68,0.15)",
              }}
            >
              <div className="flex items-center gap-2 text-white/50">
                <Info className="w-4 h-4 text-red-400/70 flex-shrink-0" />
                <span>
                  Click pages to mark them for deletion. Red pages will be removed.
                </span>
              </div>
              <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                <button
                  onClick={handleSelectAll}
                  className="text-xs text-white/40 hover:text-white/70 transition-colors"
                  data-testid="select-all-btn"
                >
                  All
                </button>
                <span className="text-white/20">|</span>
                <button
                  onClick={handleDeselectAll}
                  className="text-xs text-white/40 hover:text-white/70 transition-colors"
                  data-testid="deselect-all-btn"
                >
                  None
                </button>
              </div>
            </div>

            {/* Thumbnail grid */}
            <div
              className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3"
              data-testid="page-select-grid"
            >
              {pages.map((page) => (
                <PageThumbnail
                  key={page.id}
                  page={page}
                  onToggle={handleToggle}
                  isLoading={isRendering && !page.thumbnail}
                  accent={tool.color}
                />
              ))}
            </div>

            {/* Summary + action */}
            <div className="mt-8 space-y-4">
              {/* Selection summary */}
              <AnimatePresence>
                {selectedCount > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div
                      className="flex items-center justify-between px-4 py-3 rounded-xl text-sm"
                      style={{
                        background: "rgba(239,68,68,0.1)",
                        border: "1px solid rgba(239,68,68,0.25)",
                      }}
                    >
                      <span className="text-red-400 font-medium">
                        {selectedCount} page{selectedCount !== 1 ? "s" : ""} marked for deletion
                      </span>
                      <span className="text-white/40">
                        {remainingCount} page{remainingCount !== 1 ? "s" : ""} will remain
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <ProcessButton
                onClick={handleProcess}
                isProcessing={isProcessing}
                disabled={isRendering || selectedCount === 0 || remainingCount === 0}
                text={
                  selectedCount === 0
                    ? "Select pages to delete"
                    : `Delete ${selectedCount} page${selectedCount !== 1 ? "s" : ""}`
                }
                color="#ef4444"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </ToolPageLayout>
  );
}
