import { useState, useEffect } from "react";
import { useFileContext } from "@/contexts/FileContext";
import { getToolByHref } from "@/lib/tools";
import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { UploadZone } from "@/components/tools/UploadZone";
import { ProcessButton } from "@/components/tools/ProcessButton";
import { DownloadResult } from "@/components/tools/DownloadResult";
import { usePdfThumbnails } from "@/hooks/usePdfThumbnails";
import { saveAs } from "file-saver";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { CheckSquare, Square, Loader2, Scissors } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ExtractPages() {
  const tool = getToolByHref("/tools/extract-pages")!;
  const { pendingFiles, clearPendingFiles } = useFileContext();
  const [file, setFile] = useState<File | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; name: string } | null>(null);
  const { toast } = useToast();
  const { pages, isRendering } = usePdfThumbnails(file);

  useEffect(() => {
    if (pendingFiles.length > 0) { setFile(pendingFiles[0]); clearPendingFiles(); }
  }, [pendingFiles, clearPendingFiles]);

  const handleFilesAccepted = (f: File[]) => { setFile(f[0]); setResult(null); setSelected(new Set()); };
  const handleReset = () => { setFile(null); setResult(null); setSelected(new Set()); };

  const togglePage = (idx: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  const selectAll = () => setSelected(new Set(pages.map((p) => p.index)));
  const deselectAll = () => setSelected(new Set());

  const handleProcess = async () => {
    if (!file || selected.size === 0) return;
    setIsProcessing(true);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const arrayBuffer = await file.arrayBuffer();
      const src = await PDFDocument.load(arrayBuffer);
      const out = await PDFDocument.create();
      const indices = Array.from(selected).sort((a, b) => a - b);
      const copied = await out.copyPages(src, indices);
      copied.forEach((p) => out.addPage(p));
      const bytes = await out.save();
      const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
      setResult({ blob, name: file.name.replace(".pdf", "-extracted.pdf") });
      toast({ title: "Done!", description: `${selected.size} pages extracted.` });
    } catch {
      toast({ title: "Error", description: "Failed to extract pages.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

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
            <div className="flex items-center justify-between mb-5 px-1">
              <div>
                <p className="text-sm font-medium text-foreground/80">{file.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isRendering ? "Rendering pages..." : `${pages.length} pages — click to select which to keep`}
                </p>
              </div>
              <button onClick={handleReset} className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2" data-testid="change-file-btn">Change file</button>
            </div>

            {/* Info + bulk */}
            <div className="flex items-center justify-between mb-5 px-4 py-3 rounded-xl text-sm" style={{ background: "rgba(79,110,247,0.07)", border: "1px solid rgba(79,110,247,0.15)" }}>
              <div className="flex items-center gap-2 text-white/50">
                <Scissors className="w-4 h-4 text-primary/60 flex-shrink-0" />
                <span>Click pages to select them for extraction. Selected pages form the new PDF.</span>
              </div>
              <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                <button onClick={selectAll} className="text-xs text-white/40 hover:text-white/70 transition-colors" data-testid="select-all-btn">All</button>
                <span className="text-white/20">|</span>
                <button onClick={deselectAll} className="text-xs text-white/40 hover:text-white/70 transition-colors" data-testid="deselect-all-btn">None</button>
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3" data-testid="extract-page-grid">
              {pages.map((page, idx) => {
                const sel = selected.has(page.index);
                return (
                  <motion.button
                    key={page.index}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={() => togglePage(page.index)}
                    className={cn(
                      "group relative rounded-xl border-2 overflow-hidden cursor-pointer transition-all duration-200",
                      sel ? "border-primary/80 shadow-[0_0_20px_rgba(79,110,247,0.25)]" : "border-white/10 hover:border-white/25"
                    )}
                    data-testid={`extract-page-${idx}`}
                  >
                    {/* Selected overlay */}
                    <AnimatePresence>
                      {sel && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-10 bg-primary/10" />
                      )}
                    </AnimatePresence>

                    {/* Checkbox */}
                    <div className={cn("absolute top-2 right-2 z-20 transition-opacity", sel ? "opacity-100" : "opacity-0 group-hover:opacity-100")}>
                      {sel ? <CheckSquare className="w-5 h-5 text-primary" /> : <Square className="w-5 h-5 text-white/40" />}
                    </div>

                    <div className="w-full aspect-[3/4] bg-black/10 flex items-center justify-center overflow-hidden">
                      {!page.thumbnail ? (
                        <Loader2 className="w-5 h-5 animate-spin text-white/20" />
                      ) : (
                        <img src={page.thumbnail} alt={`Page ${idx + 1}`} className="w-full h-full object-contain" draggable={false} />
                      )}
                    </div>

                    <div className={cn("px-2 py-1.5 text-center transition-colors", sel ? "bg-primary/10" : "bg-white/3")}>
                      <span className={cn("text-xs font-semibold", sel ? "text-primary" : "text-white/50")}>
                        {sel ? "Keep" : `Page ${idx + 1}`}
                      </span>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            <div className="mt-8 space-y-4">
              <AnimatePresence>
                {selected.size > 0 && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 rounded-xl text-sm" style={{ background: "rgba(79,110,247,0.1)", border: "1px solid rgba(79,110,247,0.25)" }}>
                      <span className="text-primary font-medium">{selected.size} page{selected.size !== 1 ? "s" : ""} selected</span>
                      <span className="text-white/40">{pages.length - selected.size} page{pages.length - selected.size !== 1 ? "s" : ""} will be discarded</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <ProcessButton
                onClick={handleProcess}
                isProcessing={isProcessing}
                disabled={isRendering || selected.size === 0}
                text={selected.size === 0 ? "Select pages to extract" : `Extract ${selected.size} page${selected.size !== 1 ? "s" : ""}`}
                color={tool.color}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </ToolPageLayout>
  );
}
