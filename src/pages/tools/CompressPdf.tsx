import { useState, useEffect } from "react";
import { useFileContext } from "../../contexts/FileContext";
import { getToolByHref } from "../../lib/tools";
import { ToolPageLayout } from "../../components/tools/ToolPageLayout";
import { UploadZone } from "../../components/tools/UploadZone";
import { ProcessButton } from "../../components/tools/ProcessButton";
import { DownloadResult } from "../../components/tools/DownloadResult";
import { FileInfoCard } from "../../components/tools/FileInfoCard";
import { saveAs } from "file-saver";
import { useToast } from "../../hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingDown } from "lucide-react";
import { cn } from "../../lib/utils";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

const LEVELS = [
  { id: "low", label: "Low", desc: "Minimal compression, best quality" },
  { id: "medium", label: "Medium", desc: "Balanced size and quality" },
  { id: "high", label: "High", desc: "Maximum compression" },
] as const;

export default function CompressPdf() {
  const tool = getToolByHref("/tools/compress-pdf")!;
  const { pendingFiles, clearPendingFiles } = useFileContext();
  const [file, setFile] = useState<File | null>(null);
  const [level, setLevel] = useState<"low" | "medium" | "high">("medium");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; name: string; savings: number } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (pendingFiles.length > 0) { setFile(pendingFiles[0]); clearPendingFiles(); }
  }, [pendingFiles, clearPendingFiles]);

  const handleFilesAccepted = (f: File[]) => { setFile(f[0]); setResult(null); };
  const handleReset = () => { setFile(null); setResult(null); };

  const handleProcess = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const ab = await file.arrayBuffer();
      const pdf = await PDFDocument.load(ab, { updateMetadata: false });
      const bytes = await pdf.save({ useObjectStreams: level !== "low", addDefaultPage: false });
      const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
      const savings = ((1 - blob.size / file.size) * 100);
      setResult({ blob, name: file.name.replace(".pdf", "-compressed.pdf"), savings });
      toast({ title: "Done!", description: savings > 0 ? `Reduced by ${savings.toFixed(1)}%` : "PDF re-saved with optimized structure." });
    } catch {
      toast({ title: "Error", description: "Failed to compress PDF.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolPageLayout tool={tool}>
      <AnimatePresence mode="wait">
        {result ? (
          <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
            <div className="grid grid-cols-3 gap-3 p-5 rounded-xl border border-white/10 bg-white/5">
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Original</p>
                <p className="text-lg font-bold">{formatBytes(file!.size)}</p>
              </div>
              <div className="text-center flex flex-col items-center justify-center">
                <TrendingDown className="w-5 h-5 text-emerald-400 mb-1" />
                <p className="text-lg font-bold text-emerald-400">{result.savings > 0 ? `-${result.savings.toFixed(1)}%` : "~0%"}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Compressed</p>
                <p className="text-lg font-bold text-emerald-400">{formatBytes(result.blob.size)}</p>
              </div>
            </div>
            <DownloadResult onDownload={() => saveAs(result.blob, result.name)} onReset={handleReset} filename={result.name} size={result.blob.size} />
          </motion.div>
        ) : !file ? (
          <motion.div key="upload" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <UploadZone tool={tool} onFilesAccepted={handleFilesAccepted} maxFiles={1} />
          </motion.div>
        ) : (
          <motion.div key="editor" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
            <FileInfoCard file={file} onRemove={handleReset} extra={<span className="text-xs text-muted-foreground">Current size: {formatBytes(file.size)}</span>} />
            <div className="p-5 rounded-xl border border-white/10 bg-white/5 space-y-3">
              <p className="text-sm font-medium">Compression level</p>
              <div className="grid grid-cols-3 gap-2">
                {LEVELS.map((l) => (
                  <button key={l.id} onClick={() => setLevel(l.id)} className={cn("flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all duration-200 text-center", level === l.id ? "border-primary bg-primary/10 text-primary" : "border-white/10 text-white/50 hover:border-white/25")}>
                    <span className="text-sm font-bold">{l.label}</span>
                    <span className="text-[10px] opacity-70 leading-tight">{l.desc}</span>
                  </button>
                ))}
              </div>
            </div>
            <ProcessButton onClick={handleProcess} isProcessing={isProcessing} disabled={false} text="Compress PDF" color={tool.color} />
          </motion.div>
        )}
      </AnimatePresence>
    </ToolPageLayout>
  );
}
