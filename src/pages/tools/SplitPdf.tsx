import { useState, useEffect } from "react";
import { useFileContext } from "../../contexts/FileContext";
import { getToolByHref } from "../../lib/tools";
import { ToolPageLayout } from "../../components/tools/ToolPageLayout";
import { UploadZone } from "../../components/tools/UploadZone";
import { ProcessButton } from "../../components/tools/ProcessButton";
import { DownloadResult } from "../../components/tools/DownloadResult";
import { usePdfThumbnails } from "../../hooks/usePdfThumbnails";
import { zipFiles } from "../../lib/processors/archiveProcessor";
import { saveAs } from "file-saver";
import { useToast } from "../../hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ScissorsLineDashed } from "lucide-react";
import { cn } from "../../lib/utils";

export default function SplitPdf() {
  const tool = getToolByHref("/tools/split-pdf")!;
  const { pendingFiles, clearPendingFiles } = useFileContext();
  const [file, setFile] = useState<File | null>(null);
  const [splitPoints, setSplitPoints] = useState<Set<number>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; name: string } | null>(null);
  const { toast } = useToast();
  const { pages, isRendering } = usePdfThumbnails(file);

  useEffect(() => {
    if (pendingFiles.length > 0) { setFile(pendingFiles[0]); clearPendingFiles(); }
  }, [pendingFiles, clearPendingFiles]);

  const handleFilesAccepted = (f: File[]) => { setFile(f[0]); setResult(null); setSplitPoints(new Set()); };
  const handleReset = () => { setFile(null); setResult(null); setSplitPoints(new Set()); };

  const toggleSplitPoint = (afterIdx: number) => {
    setSplitPoints((prev) => {
      const next = new Set(prev);
      next.has(afterIdx) ? next.delete(afterIdx) : next.add(afterIdx);
      return next;
    });
  };

  const splitAllPages = async () => {
    if (!file || pages.length === 0) return;
    setIsProcessing(true);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const arrayBuffer = await file.arrayBuffer();
      const src = await PDFDocument.load(arrayBuffer);
      const splitFiles: File[] = [];

      for (let i = 0; i < pages.length; i++) {
        const out = await PDFDocument.create();
        const [copied] = await out.copyPages(src, [i]);
        out.addPage(copied);
        const bytes = await out.save();
        splitFiles.push(new File([new Uint8Array(bytes)], `page-${i + 1}.pdf`, { type: "application/pdf" }));
      }

      const zipBlob = await zipFiles(splitFiles);
      setResult({ blob: zipBlob, name: `${file.name.replace(".pdf", "")}-split.zip` });
      toast({ title: "Done!", description: `Split into ${pages.length} individual PDFs.` });
    } catch {
      toast({ title: "Error", description: "Failed to split PDF.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const splitAtPoints = async () => {
    if (!file || pages.length === 0) return;
    setIsProcessing(true);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const arrayBuffer = await file.arrayBuffer();
      const src = await PDFDocument.load(arrayBuffer);

      const breakPoints = Array.from(splitPoints).sort((a, b) => a - b);
      const segments: number[][] = [];
      let start = 0;
      for (const bp of breakPoints) {
        segments.push(Array.from({ length: bp - start + 1 }, (_, i) => start + i));
        start = bp + 1;
      }
      segments.push(Array.from({ length: pages.length - start }, (_, i) => start + i));

      const splitFiles: File[] = [];
      for (let s = 0; s < segments.length; s++) {
        const out = await PDFDocument.create();
        const copied = await out.copyPages(src, segments[s]);
        copied.forEach((p) => out.addPage(p));
        const bytes = await out.save();
        splitFiles.push(new File([new Uint8Array(bytes)], `part-${s + 1}.pdf`, { type: "application/pdf" }));
      }

      const zipBlob = await zipFiles(splitFiles);
      setResult({ blob: zipBlob, name: `${file.name.replace(".pdf", "")}-split.zip` });
      toast({ title: "Done!", description: `Split into ${segments.length} parts.` });
    } catch {
      toast({ title: "Error", description: "Failed to split PDF.", variant: "destructive" });
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
                  {isRendering ? "Rendering pages..." : `${pages.length} pages`}
                </p>
              </div>
              <button onClick={handleReset} className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2">Change file</button>
            </div>

            <div className="flex items-center gap-2 mb-5 px-4 py-3 rounded-xl text-sm text-white/50" style={{ background: "rgba(99,102,241,0.07)", border: "1px solid rgba(99,102,241,0.15)" }}>
              <ScissorsLineDashed className="w-4 h-4 text-indigo-400/60 flex-shrink-0" />
              <span>Click the scissors between pages to mark split points, then split at those points — or split every page individually.</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {pages.map((page, idx) => (
                <div key={page.index} className="flex items-stretch gap-1">
                  <div className="w-20 rounded-lg border border-white/10 bg-white/5 overflow-hidden flex-shrink-0">
                    <div className="aspect-[3/4] flex items-center justify-center bg-black/10 overflow-hidden">
                      {!page.thumbnail ? (
                        <Loader2 className="w-4 h-4 animate-spin text-white/20" />
                      ) : (
                        <img src={page.thumbnail} alt={`Page ${idx + 1}`} className="w-full h-full object-contain" draggable={false} />
                      )}
                    </div>
                    <div className="py-1 text-center">
                      <span className="text-[10px] text-white/40">{idx + 1}</span>
                    </div>
                  </div>

                  {idx < pages.length - 1 && (
                    <button
                      onClick={() => toggleSplitPoint(idx)}
                      className={cn(
                        "w-8 flex items-center justify-center rounded-lg border transition-all duration-200 cursor-pointer",
                        splitPoints.has(idx)
                          ? "border-indigo-500/70 bg-indigo-500/15 text-indigo-400"
                          : "border-white/5 bg-white/3 text-white/20 hover:border-white/20 hover:text-white/40"
                      )}
                      title={splitPoints.has(idx) ? "Remove split point" : "Add split point here"}
                    >
                      <ScissorsLineDashed className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3">
              {splitPoints.size > 0 && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="px-4 py-2.5 rounded-xl text-sm text-white/50 mb-3" style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)" }}>
                    Split into <span className="text-indigo-400 font-semibold">{splitPoints.size + 1} parts</span> at {splitPoints.size} marked point{splitPoints.size !== 1 ? "s" : ""}
                  </div>
                  <ProcessButton onClick={splitAtPoints} isProcessing={isProcessing} disabled={isRendering} text={`Split into ${splitPoints.size + 1} parts`} color="#6366f1" />
                </motion.div>
              )}
              <ProcessButton onClick={splitAllPages} isProcessing={isProcessing} disabled={isRendering || pages.length < 2} text="Split Every Page" color={tool.color} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </ToolPageLayout>
  );
}
