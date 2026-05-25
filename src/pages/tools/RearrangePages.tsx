import { useState, useEffect, useRef, useCallback } from "react";
import { useFileContext } from "../../contexts/FileContext";
import { getToolByHref } from "../../lib/tools";
import { ToolPageLayout } from "../../components/tools/ToolPageLayout";
import { UploadZone } from "../../components/tools/UploadZone";
import { ProcessButton } from "../../components/tools/ProcessButton";
import { DownloadResult } from "../../components/tools/DownloadResult";
import { saveAs } from "file-saver";
import { useToast } from "../../hooks/use-toast";
import { motion, AnimatePresence, Reorder, useDragControls } from "framer-motion";
import { GripVertical, RotateCw, Trash2, Loader2, GripHorizontal } from "lucide-react";

interface PageItem {
  id: string;
  originalIndex: number;
  rotation: number;
  thumbnail: string | null;
}

function PageThumbnail({ page, index, onRotate, onRemove, isLoading }: { page: PageItem; index: number; onRotate: (id: string) => void; onRemove: (id: string) => void; isLoading: boolean; }) {
  const dragControls = useDragControls();
  return (
    <Reorder.Item value={page} id={page.id} dragListener={false} dragControls={dragControls} className="relative select-none" whileDrag={{ scale: 1.05, zIndex: 50, boxShadow: "0 20px 60px rgba(79,110,247,0.4)" }} layout transition={{ duration: 0.2 }}>
      <motion.div className="group relative rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden cursor-default" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }} whileHover={{ borderColor: "rgba(79,110,247,0.5)", boxShadow: "0 8px 30px rgba(79,110,247,0.2)" }} transition={{ duration: 0.2 }}>
        <div className="absolute top-2 left-2 z-10 p-1.5 rounded-lg bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing" onPointerDown={(e) => dragControls.start(e)} title="Drag to reorder">
          <GripHorizontal className="w-4 h-4 text-white/70" />
        </div>
        <div className="absolute top-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onRotate(page.id)} className="p-1.5 rounded-lg bg-black/40 backdrop-blur-sm hover:bg-blue-500/40 transition-colors" title="Rotate 90°">
            <RotateCw className="w-3.5 h-3.5 text-white/70 hover:text-white" />
          </button>
          <button onClick={() => onRemove(page.id)} className="p-1.5 rounded-lg bg-black/40 backdrop-blur-sm hover:bg-red-500/40 transition-colors" title="Remove page">
            <Trash2 className="w-3.5 h-3.5 text-white/70 hover:text-white" />
          </button>
        </div>
        <div className="w-full aspect-[3/4] bg-white/3 flex items-center justify-center overflow-hidden">
          {isLoading || !page.thumbnail ? (
            <div className="flex flex-col items-center gap-2 text-white/30">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="text-xs">Rendering...</span>
            </div>
          ) : (
            <img src={page.thumbnail} alt={`Page ${index + 1}`} className="w-full h-full object-contain transition-transform duration-300" style={{ transform: `rotate(${page.rotation}deg)` }} draggable={false} />
          )}
        </div>
        <div className="px-3 py-2 flex items-center justify-between">
          <span className="text-xs font-semibold text-white/60">Page {index + 1}</span>
          <span className="text-xs text-white/30">orig. {page.originalIndex + 1}</span>
        </div>
      </motion.div>
    </Reorder.Item>
  );
}

export default function RearrangePages() {
  const tool = getToolByHref("/tools/rearrange-pages")!;
  const { pendingFiles, clearPendingFiles } = useFileContext();
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [isRendering, setIsRendering] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; name: string } | null>(null);
  const { toast } = useToast();
  const renderingRef = useRef(false);

  useEffect(() => {
    if (pendingFiles.length > 0) { setFile(pendingFiles[0]); clearPendingFiles(); }
  }, [pendingFiles, clearPendingFiles]);

  const renderThumbnails = useCallback(async (pdfFile: File) => {
    if (renderingRef.current) return;
    renderingRef.current = true;
    setIsRendering(true);
    setPages([]);
    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;
      const initialPages: PageItem[] = Array.from({ length: numPages }, (_, i) => ({ id: `page-${i}`, originalIndex: i, rotation: 0, thumbnail: null }));
      setPages(initialPages);
      for (let i = 0; i < numPages; i++) {
        const page = await pdf.getPage(i + 1);
        const viewport = page.getViewport({ scale: 1.2 });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d")!;
        await page.render({ canvasContext: ctx, viewport }).promise;
        const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
        setPages((prev) => prev.map((p) => p.id === `page-${i}` ? { ...p, thumbnail: dataUrl } : p));
      }
    } catch {
      toast({ title: "Render error", description: "Could not render PDF pages.", variant: "destructive" });
    } finally {
      setIsRendering(false);
      renderingRef.current = false;
    }
  }, [toast]);

  useEffect(() => {
    if (file) renderThumbnails(file);
  }, [file, renderThumbnails]);

  const handleFilesAccepted = (newFiles: File[]) => { setFile(newFiles[0]); setResult(null); };
  const handleRotate = (id: string) => setPages((prev) => prev.map((p) => p.id === id ? { ...p, rotation: (p.rotation + 90) % 360 } : p));
  const handleRemove = (id: string) => setPages((prev) => prev.filter((p) => p.id !== id));

  const handleProcess = async () => {
    if (!file || pages.length === 0) return;
    setIsProcessing(true);
    try {
      const { PDFDocument, degrees } = await import("pdf-lib");
      const arrayBuffer = await file.arrayBuffer();
      const sourcePdf = await PDFDocument.load(arrayBuffer);
      const newPdf = await PDFDocument.create();
      const pageIndices = pages.map((p) => p.originalIndex);
      const copiedPages = await newPdf.copyPages(sourcePdf, pageIndices);
      copiedPages.forEach((page, i) => {
        const rotation = pages[i].rotation;
        if (rotation !== 0) page.setRotation(degrees(rotation));
        newPdf.addPage(page);
      });
      const bytes = await newPdf.save();
      const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
      setResult({ blob, name: file.name.replace(".pdf", "-rearranged.pdf") });
      toast({ title: "Done!", description: "Your PDF pages have been rearranged." });
    } catch {
      toast({ title: "Processing failed", description: "Could not rearrange pages.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => { setFile(null); setPages([]); setResult(null); renderingRef.current = false; };

  return (
    <ToolPageLayout tool={tool}>
      <AnimatePresence mode="wait">
        {result ? (
          <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <DownloadResult onDownload={() => saveAs(result.blob, result.name)} onReset={handleReset} filename={result.name} size={result.blob.size} />
          </motion.div>
        ) : !file ? (
          <motion.div key="upload" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <UploadZone tool={tool} onFilesAccepted={handleFilesAccepted} maxFiles={1} />
          </motion.div>
        ) : (
          <motion.div key="editor" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="flex items-center justify-between mb-6 px-1">
              <div>
                <p className="text-sm font-medium text-foreground/80">{file.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{isRendering ? "Rendering thumbnails..." : `${pages.length} page${pages.length !== 1 ? "s" : ""} — drag to reorder`}</p>
              </div>
              <button onClick={handleReset} className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2">Change file</button>
            </div>
            <div className="flex items-center gap-2 mb-6 px-4 py-3 rounded-xl text-sm text-white/50" style={{ background: "rgba(79,110,247,0.08)", border: "1px solid rgba(79,110,247,0.15)" }}>
              <GripVertical className="w-4 h-4 text-primary/60 flex-shrink-0" />
              <span>Hover a page to reveal the drag handle, rotation, and remove buttons. Drop anywhere to reorder.</span>
            </div>
            <Reorder.Group axis="y" values={pages} onReorder={setPages} className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3" as="div" layoutScroll>
              {pages.map((page, index) => (
                <PageThumbnail key={page.id} page={page} index={index} onRotate={handleRotate} onRemove={handleRemove} isLoading={isRendering && !page.thumbnail} />
              ))}
            </Reorder.Group>
            <div className="mt-8 space-y-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                <span>{pages.length} pages in new document</span>
                {pages.length > 0 && <span className="text-primary/70">Order: {pages.map((p) => p.originalIndex + 1).join(" → ")}</span>}
              </div>
              <ProcessButton onClick={handleProcess} isProcessing={isProcessing} disabled={isRendering || pages.length === 0} text="Save Rearranged PDF" color={tool.color} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </ToolPageLayout>
  );
}
