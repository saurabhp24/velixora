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
import { GripHorizontal, X, Plus } from "lucide-react";
import { useDropzone } from "react-dropzone";

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

interface ImageItem {
  id: string;
  file: File;
  src: string;
}

function ImageCard({ item, onRemove }: { item: ImageItem; onRemove: () => void }) {
  const dragControls = useDragControls();
  return (
    <Reorder.Item value={item} id={item.id} dragListener={false} dragControls={dragControls} whileDrag={{ scale: 1.05, zIndex: 50 }} layout transition={{ duration: 0.15 }}>
      <motion.div className="group relative rounded-xl border border-white/10 bg-white/5 overflow-hidden" whileHover={{ borderColor: "rgba(79,110,247,0.4)" }}>
        <div className="aspect-[4/3] overflow-hidden bg-black/20">
          <img src={item.src} alt={item.file.name} className="w-full h-full object-cover" draggable={false} />
        </div>
        <div className="px-2 py-1.5 flex items-center justify-between gap-1">
          <span className="text-[10px] text-white/40 truncate flex-1">{item.file.name}</span>
          <span className="text-[10px] text-white/25 flex-shrink-0">{formatBytes(item.file.size)}</span>
        </div>
        {/* Hover controls */}
        <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onRemove} className="p-1 rounded-md bg-black/60 hover:bg-red-500/60 transition-colors" data-testid={`remove-img-${item.id}`}><X className="w-3 h-3 text-white" /></button>
          <div className="p-1 rounded-md bg-black/60 cursor-grab" onPointerDown={(e) => dragControls.start(e)} data-testid={`drag-img-${item.id}`} title="Drag to reorder">
            <GripHorizontal className="w-3 h-3 text-white" />
          </div>
        </div>
      </motion.div>
    </Reorder.Item>
  );
}

export default function JpgToPdf() {
  const tool = getToolByHref("/tools/jpg-to-pdf")!;
  const { pendingFiles, clearPendingFiles } = useFileContext();
  const [items, setItems] = useState<ImageItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; name: string } | null>(null);
  const { toast } = useToast();

  const addFiles = useCallback((files: File[]) => {
    const newItems = files.map((f, i) => ({
      id: `${f.name}-${Date.now()}-${i}`,
      file: f,
      src: URL.createObjectURL(f),
    }));
    setItems((prev) => [...prev, ...newItems]);
  }, []);

  useEffect(() => {
    if (pendingFiles.length > 0) { addFiles(pendingFiles); clearPendingFiles(); }
  }, [pendingFiles, clearPendingFiles, addFiles]);

  useEffect(() => {
    return () => items.forEach((item) => URL.revokeObjectURL(item.src));
  }, [items]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: addFiles,
    accept: { "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"], "image/webp": [".webp"] },
  });

  const handleProcess = async () => {
    if (items.length === 0) return;
    setIsProcessing(true);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const pdf = await PDFDocument.create();
      for (const item of items) {
        const ab = await item.file.arrayBuffer();
        const isPng = item.file.type === "image/png";
        const img = isPng ? await pdf.embedPng(ab) : await pdf.embedJpg(ab);
        const page = pdf.addPage([img.width, img.height]);
        page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
      }
      const bytes = await pdf.save();
      const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
      setResult({ blob, name: "images.pdf" });
      toast({ title: "Done!", description: `${items.length} image${items.length !== 1 ? "s" : ""} converted to PDF.` });
    } catch {
      toast({ title: "Error", description: "Failed to convert images to PDF.", variant: "destructive" });
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
            <div {...getRootProps()} className={`rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-all duration-300 ${isDragActive ? "border-primary bg-primary/5" : "border-white/15 hover:border-primary/40 bg-white/3"}`}>
              <input {...getInputProps()} data-testid="jpg-upload-input" />
              <div className="flex flex-col items-center gap-2 text-white/40">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Plus className="w-5 h-5 text-primary" />
                </div>
                <p className="text-sm">{isDragActive ? "Drop images here" : "Drop images here or click to add — JPG, PNG, WEBP"}</p>
              </div>
            </div>

            {/* Image grid */}
            {items.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <p className="text-xs text-muted-foreground">{items.length} image{items.length !== 1 ? "s" : ""} — drag to set PDF page order</p>
                  <button onClick={handleReset} className="text-xs text-muted-foreground hover:text-foreground transition-colors" data-testid="clear-all-btn">Clear all</button>
                </div>
                <Reorder.Group axis="y" values={items} onReorder={setItems} className="grid grid-cols-3 sm:grid-cols-4 gap-3" as="div" data-testid="image-grid">
                  {items.map((item) => (
                    <ImageCard key={item.id} item={item} onRemove={() => setItems((prev) => prev.filter((p) => p.id !== item.id))} />
                  ))}
                </Reorder.Group>
              </div>
            )}

            {items.length > 0 && (
              <ProcessButton onClick={handleProcess} isProcessing={isProcessing} disabled={false} text={`Convert ${items.length} Image${items.length !== 1 ? "s" : ""} to PDF`} color={tool.color} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </ToolPageLayout>
  );
}
