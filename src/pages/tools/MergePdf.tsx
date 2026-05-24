import { useState, useEffect, useCallback } from "react";
import { useFileContext } from "../../contexts/FileContext";
import { getToolByHref } from "../../lib/tools";
import { ToolPageLayout } from "../../components/tools/ToolPageLayout";
import { UploadZone } from "../../components/tools/UploadZone";
import { ProcessButton } from "../../components/tools/ProcessButton";
import { DownloadResult } from "../../components/tools/DownloadResult";
import { saveAs } from "file-saver";
import { useToast } from "../../hooks/use-toast";
import { motion, AnimatePresence, Reorder, useDragControls } from "framer-motion";
import { GripHorizontal, X, FileText, Loader2, Plus } from "lucide-react";
import { useDropzone } from "react-dropzone";

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

interface PdfItem {
  id: string;
  file: File;
  pageCount: number | null;
  thumbnail: string | null;
}

async function getPageCount(file: File): Promise<number> {
  const { PDFDocument } = await import("pdf-lib");
  const ab = await file.arrayBuffer();
  const doc = await PDFDocument.load(ab);
  return doc.getPageCount();
}

async function getThumbnail(file: File): Promise<string> {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
  const ab = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: ab }).promise;
  const page = await pdf.getPage(1);
  const viewport = page.getViewport({ scale: 0.8 });
  const canvas = document.createElement("canvas");
  canvas.width = viewport.width; canvas.height = viewport.height;
  const ctx2d = canvas.getContext("2d")!;
  await page.render({ canvas, canvasContext: ctx2d, viewport }).promise;
  return canvas.toDataURL("image/jpeg", 0.6);
}

function PdfCard({ item, onRemove }: { item: PdfItem; onRemove: () => void }) {
  const dragControls = useDragControls();
  return (
    <Reorder.Item value={item} id={item.id} dragListener={false} dragControls={dragControls} whileDrag={{ scale: 1.02, zIndex: 50 }} layout transition={{ duration: 0.15 }}>
      <motion.div className="flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/5 cursor-default" whileHover={{ borderColor: "rgba(79,110,247,0.3)" }}>
        {/* Thumbnail */}
        <div className="w-10 h-14 rounded-lg bg-black/20 flex items-center justify-center overflow-hidden flex-shrink-0 border border-white/10">
          {item.thumbnail ? (
            <img src={item.thumbnail} alt={item.file.name} className="w-full h-full object-cover" draggable={false} />
          ) : (
            <Loader2 className="w-4 h-4 animate-spin text-white/20" />
          )}
        </div>
        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground/80 truncate">{item.file.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-muted-foreground">{formatBytes(item.file.size)}</span>
            {item.pageCount !== null && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary/70 font-medium">{item.pageCount} page{item.pageCount !== 1 ? "s" : ""}</span>
            )}
          </div>
        </div>
        {/* Controls */}
        <div className="flex items-center gap-1">
          <button onClick={onRemove} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/30 hover:text-white/70" data-testid={`remove-pdf-${item.id}`}><X className="w-3.5 h-3.5" /></button>
          <div className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/30 hover:text-white/70 cursor-grab" onPointerDown={(e) => dragControls.start(e)} data-testid={`drag-pdf-${item.id}`} title="Drag to reorder">
            <GripHorizontal className="w-3.5 h-3.5" />
          </div>
        </div>
      </motion.div>
    </Reorder.Item>
  );
}

export default function MergePdf() {
  const tool = getToolByHref("/tools/merge-pdf")!;
  const { pendingFiles, clearPendingFiles } = useFileContext();
  const [items, setItems] = useState<PdfItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; name: string } | null>(null);
  const { toast } = useToast();

  const addFiles = useCallback(async (files: File[]) => {
    const newItems: PdfItem[] = files.map((f, i) => ({
      id: `${f.name}-${Date.now()}-${i}`,
      file: f,
      pageCount: null,
      thumbnail: null,
    }));
    setItems((prev) => [...prev, ...newItems]);
    for (const item of newItems) {
      Promise.all([getPageCount(item.file), getThumbnail(item.file)]).then(([count, thumb]) => {
        setItems((prev) => prev.map((p) => p.id === item.id ? { ...p, pageCount: count, thumbnail: thumb } : p));
      }).catch(() => {
        setItems((prev) => prev.map((p) => p.id === item.id ? { ...p, pageCount: 0 } : p));
      });
    }
  }, []);

  useEffect(() => {
    if (pendingFiles.length > 0) { addFiles(pendingFiles); clearPendingFiles(); }
  }, [pendingFiles, clearPendingFiles, addFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: addFiles,
    accept: { "application/pdf": [".pdf"] },
    noClick: false,
  });

  const handleProcess = async () => {
    if (items.length < 2) {
      toast({ title: "Need more files", description: "Upload at least 2 PDFs to merge.", variant: "destructive" });
      return;
    }
    setIsProcessing(true);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const merged = await PDFDocument.create();
      for (const item of items) {
        const ab = await item.file.arrayBuffer();
        const src = await PDFDocument.load(ab);
        const copied = await merged.copyPages(src, src.getPageIndices());
        copied.forEach((p) => merged.addPage(p));
      }
      const bytes = await merged.save();
      const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
      setResult({ blob, name: "merged-document.pdf" });
      toast({ title: "Done!", description: `${items.length} PDFs merged.` });
    } catch {
      toast({ title: "Error", description: "Failed to merge PDFs.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => { setItems([]); setResult(null); };

  return (
    <ToolPageLayout tool={tool}>
      <AnimatePresence mode="wait">
        {result ? (
          <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <DownloadResult onDownload={() => saveAs(result.blob, result.name)} onReset={handleReset} filename={result.name} size={result.blob.size} />
          </motion.div>
        ) : (
          <motion.div key="editor" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            {/* Drop zone */}
            <div
              {...getRootProps()}
              className={`rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-300 ${isDragActive ? "border-primary bg-primary/5" : "border-white/15 hover:border-primary/40 bg-white/3"}`}
            >
              <input {...getInputProps()} data-testid="merge-upload-input" />
              <div className="flex flex-col items-center gap-2 text-white/40">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Plus className="w-5 h-5 text-primary" />
                </div>
                <p className="text-sm">{isDragActive ? "Drop PDFs here" : "Drop PDFs here or click to add more"}</p>
              </div>
            </div>

            {/* PDF list */}
            {items.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <p className="text-xs text-muted-foreground">{items.length} file{items.length !== 1 ? "s" : ""} — drag to reorder merge order</p>
                  <button onClick={() => setItems([])} className="text-xs text-muted-foreground hover:text-foreground transition-colors" data-testid="clear-all-btn">Clear all</button>
                </div>
                <Reorder.Group axis="y" values={items} onReorder={setItems} className="space-y-2" as="div" data-testid="merge-file-list">
                  {items.map((item) => (
                    <PdfCard key={item.id} item={item} onRemove={() => setItems((prev) => prev.filter((p) => p.id !== item.id))} />
                  ))}
                </Reorder.Group>
              </div>
            )}

            {items.length > 0 && (
              <div className="space-y-2">
                {items.length < 2 && (
                  <p className="text-xs text-center text-amber-400/70">Add at least one more PDF to merge</p>
                )}
                <ProcessButton
                  onClick={handleProcess}
                  isProcessing={isProcessing}
                  disabled={items.length < 2}
                  text={`Merge ${items.length} PDF${items.length !== 1 ? "s" : ""}`}
                  color={tool.color}
                />
              </div>
            )}

            {items.length === 0 && (
              <div className="flex flex-col items-center gap-3 py-6 text-white/30">
                <FileText className="w-10 h-10" />
                <p className="text-sm">Upload PDFs above to get started</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </ToolPageLayout>
  );
}
