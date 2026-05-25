import { useState, useEffect, useCallback } from "react";
import { useFileContext } from "../../contexts/FileContext";
import { getToolByHref } from "../../lib/tools";
import { ToolPageLayout } from "../../components/tools/ToolPageLayout";
import { ProcessButton } from "../../components/tools/ProcessButton";
import { DownloadResult } from "../../components/tools/DownloadResult";
import { saveAs } from "file-saver";
import { useToast } from "../../hooks/use-toast";
import { motion, AnimatePresence, Reorder, useDragControls } from "framer-motion";
import { GripVertical, X, Plus, FileText } from "lucide-react";
import { useDropzone } from "react-dropzone";

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

interface PdfItem { id: string; file: File; pageCount: number; }

function PdfCard({ item, onRemove }: { item: PdfItem; onRemove: () => void }) {
  const dragControls = useDragControls();
  return (
    <Reorder.Item value={item} id={item.id} dragListener={false} dragControls={dragControls} whileDrag={{ scale: 1.02, zIndex: 50 }} layout transition={{ duration: 0.15 }}>
      <motion.div className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 hover:border-primary/30 transition-colors">
        <div className="p-1 rounded cursor-grab" onPointerDown={(e) => dragControls.start(e)}><GripVertical className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors" /></div>
        <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0"><FileText className="w-4 h-4 text-red-400" /></div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{item.file.name}</p>
          <p className="text-xs text-muted-foreground">{formatBytes(item.file.size)}{item.pageCount > 0 ? ` • ${item.pageCount} pages` : ""}</p>
        </div>
        <button onClick={onRemove} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100"><X className="w-4 h-4" /></button>
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

  const addFiles = useCallback((files: File[]) => {
    const newItems: PdfItem[] = files.map((f, i) => ({ id: `${f.name}-${Date.now()}-${i}`, file: f, pageCount: 0 }));
    setItems((prev) => [...prev, ...newItems]);
    newItems.forEach((item) => {
      (async () => {
        try {
          const pdfjsLib = await import("pdfjs-dist");
          pdfjsLib.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
          const ab = await item.file.arrayBuffer();
          const pdf = await pdfjsLib.getDocument({ data: ab }).promise;
          setItems((prev) => prev.map((p) => p.id === item.id ? { ...p, pageCount: pdf.numPages } : p));
        } catch {
          setItems((prev) => prev.map((p) => p.id === item.id ? { ...p, pageCount: 0 } : p));
        }
      })();
    });
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
      toast({ title: "Need more files", description: "Upload at least 2 PDFs to merge.", variant: "destructive" }); return;
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
            <div {...getRootProps()} className={`rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-300 ${isDragActive ? "border-primary bg-primary/5" : "border-white/15 hover:border-primary/40 bg-white/3"}`}>
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-2 text-white/40">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><Plus className="w-5 h-5 text-primary" /></div>
                <p className="text-sm">{isDragActive ? "Drop PDFs here" : "Drop PDFs here or click to add more"}</p>
              </div>
            </div>

            {items.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <p className="text-xs text-muted-foreground">{items.length} file{items.length !== 1 ? "s" : ""} — drag to reorder merge order</p>
                  <button onClick={() => setItems([])} className="text-xs text-muted-foreground hover:text-foreground transition-colors">Clear all</button>
                </div>
                <Reorder.Group axis="y" values={items} onReorder={setItems} className="space-y-2" as="div">
                  {items.map((item) => <PdfCard key={item.id} item={item} onRemove={() => setItems((prev) => prev.filter((p) => p.id !== item.id))} />)}
                </Reorder.Group>
              </div>
            )}

            {items.length > 0 && (
              <div className="space-y-2">
                {items.length < 2 && <p className="text-xs text-center text-amber-400/70">Add at least one more PDF to merge</p>}
                <ProcessButton onClick={handleProcess} isProcessing={isProcessing} disabled={items.length < 2} text={`Merge ${items.length} PDF${items.length !== 1 ? "s" : ""}`} color={tool.color} />
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
