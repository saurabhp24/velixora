import { useState, useEffect } from "react";
import { useFileContext } from "../../contexts/FileContext";
import { getToolByHref } from "../../lib/tools";
import { ToolPageLayout } from "../../components/tools/ToolPageLayout";
import { UploadZone } from "../../components/tools/UploadZone";
import { ProcessButton } from "../../components/tools/ProcessButton";
import { DownloadResult } from "../../components/tools/DownloadResult";
import { usePdfThumbnails } from "../../hooks/usePdfThumbnails";
import { saveAs } from "file-saver";
import { useToast } from "../../hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCw, Loader2 } from "lucide-react";

const ROTATIONS = [0, 90, 180, 270] as const;
type Rotation = (typeof ROTATIONS)[number];

export default function RotatePdf() {
  const tool = getToolByHref("/tools/rotate-pdf")!;
  const { pendingFiles, clearPendingFiles } = useFileContext();
  const [file, setFile] = useState<File | null>(null);
  const [rotations, setRotations] = useState<Rotation[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; name: string } | null>(null);
  const { toast } = useToast();
  const { pages, isRendering } = usePdfThumbnails(file);

  useEffect(() => {
    if (pendingFiles.length > 0) { setFile(pendingFiles[0]); clearPendingFiles(); }
  }, [pendingFiles, clearPendingFiles]);

  useEffect(() => {
    if (pages.length > 0 && rotations.length !== pages.length) {
      setRotations(Array(pages.length).fill(0));
    }
  }, [pages.length, rotations.length]);

  const handleFilesAccepted = (f: File[]) => { setFile(f[0]); setResult(null); setRotations([]); };
  const handleReset = () => { setFile(null); setResult(null); setRotations([]); };

  const cycleRotation = (idx: number) => {
    setRotations((prev) => {
      const next = [...prev];
      const cur = ROTATIONS.indexOf(next[idx] as Rotation);
      next[idx] = ROTATIONS[(cur + 1) % 4];
      return next;
    });
  };

  const rotateAll = (deg: Rotation) => {
    setRotations((prev) => prev.map((r) => ((r + deg) % 360) as Rotation));
  };

  const handleProcess = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const { PDFDocument, degrees } = await import("pdf-lib");
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      pdf.getPages().forEach((page, i) => {
        const rot = rotations[i] ?? 0;
        if (rot !== 0) page.setRotation(degrees(rot));
      });
      const bytes = await pdf.save();
      const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
      setResult({ blob, name: file.name.replace(".pdf", "-rotated.pdf") });
      toast({ title: "Done!", description: "PDF pages rotated." });
    } catch {
      toast({ title: "Error", description: "Failed to rotate PDF.", variant: "destructive" });
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
                  {isRendering ? "Rendering pages..." : `${pages.length} pages — click to rotate`}
                </p>
              </div>
              <button onClick={handleReset} className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2">Change file</button>
            </div>

            {pages.length > 0 && (
              <div className="flex gap-2 mb-5">
                {([90, 180, 270] as Rotation[]).map((deg) => (
                  <button key={deg} onClick={() => rotateAll(deg)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white/60 hover:text-white hover:bg-white/10 border border-white/10 transition-all">
                    <RotateCw className="w-3 h-3" /> All {deg}°
                  </button>
                ))}
                <button onClick={() => setRotations(Array(pages.length).fill(0))} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white/60 hover:text-white hover:bg-white/10 border border-white/10 transition-all ml-auto">
                  Reset all
                </button>
              </div>
            )}

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {pages.map((page, idx) => {
                const rot = rotations[idx] ?? 0;
                return (
                  <motion.button
                    key={page.index}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={() => cycleRotation(idx)}
                    className="group relative rounded-xl border border-white/10 hover:border-primary/50 bg-white/5 overflow-hidden transition-all duration-200 cursor-pointer"
                    style={rot !== 0 ? { borderColor: "rgba(79,110,247,0.5)", boxShadow: "0 0 15px rgba(79,110,247,0.15)" } : {}}
                    title={`Page ${idx + 1} — click to rotate (currently ${rot}°)`}
                  >
                    <div className="w-full aspect-[3/4] bg-black/10 flex items-center justify-center overflow-hidden">
                      {!page.thumbnail ? (
                        <Loader2 className="w-5 h-5 animate-spin text-white/20" />
                      ) : (
                        <img src={page.thumbnail} alt={`Page ${idx + 1}`} className="w-full h-full object-contain transition-transform duration-300" style={{ transform: `rotate(${rot}deg)` }} draggable={false} />
                      )}
                    </div>
                    <div className="px-2 py-1.5 flex items-center justify-between">
                      <span className="text-xs text-white/50">p. {idx + 1}</span>
                      <span className={`text-xs font-bold ${rot !== 0 ? "text-primary" : "text-white/30"}`}>{rot}°</span>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                      <div className="bg-primary/80 rounded-full p-2">
                        <RotateCw className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            <div className="mt-8">
              <ProcessButton onClick={handleProcess} isProcessing={isProcessing} disabled={isRendering || pages.length === 0} text="Apply Rotations" color={tool.color} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </ToolPageLayout>
  );
}
