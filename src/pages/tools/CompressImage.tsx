import { useState, useEffect } from "react";
import { useFileContext } from "../../contexts/FileContext";
import { getToolByHref } from "../../lib/tools";
import { ToolPageLayout } from "../../components/tools/ToolPageLayout";
import { UploadZone } from "../../components/tools/UploadZone";
import { ProcessButton } from "../../components/tools/ProcessButton";
import { DownloadResult } from "../../components/tools/DownloadResult";
import { ImagePreviewCard } from "../../components/tools/ImagePreviewCard";
import { saveAs } from "file-saver";
import { useToast } from "../../hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingDown } from "lucide-react";
import { Slider } from "../../components/ui/slider";
import { Label } from "../../components/ui/label";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function CompressImage() {
  const tool = getToolByHref("/tools/compress-image")!;
  const { pendingFiles, clearPendingFiles } = useFileContext();
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState(80);
  const [maxWidth, setMaxWidth] = useState(1920);
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
      const imageCompression = (await import("browser-image-compression")).default;
      const compressed = await imageCompression(file, {
        maxSizeMB: maxWidth >= 1920 ? 1 : 0.5,
        maxWidthOrHeight: maxWidth,
        useWebWorker: true,
        initialQuality: quality / 100,
      });
      const savings = Math.round((1 - compressed.size / file.size) * 100);
      const ext = file.name.split(".").pop() ?? "jpg";
      setResult({ blob: compressed, name: file.name.replace(`.${ext}`, `-compressed.${ext}`), savings });
      toast({ title: "Done!", description: `Saved ${savings}% — ${formatBytes(file.size - compressed.size)} reduced.` });
    } catch {
      toast({ title: "Error", description: "Failed to compress image.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const estimatedSize = file ? Math.round(file.size * (quality / 100) * 0.8) : 0;

  return (
    <ToolPageLayout tool={tool}>
      <AnimatePresence mode="wait">
        {result ? (
          <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="mb-6 flex items-center justify-center">
              <div className="flex items-center gap-6 px-6 py-4 rounded-2xl border border-primary/20 bg-primary/5">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Original</p>
                  <p className="font-mono font-medium">{formatBytes(file!.size)}</p>
                </div>
                <TrendingDown className="w-6 h-6 text-green-400 shrink-0" />
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Compressed</p>
                  <p className="font-mono font-bold text-green-400">{formatBytes(result.blob.size)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Saved</p>
                  <p className="font-bold text-green-400">{result.savings}%</p>
                </div>
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
            <ImagePreviewCard file={file} onRemove={handleReset} />
            <div className="p-5 rounded-xl border border-white/10 bg-white/5 space-y-5">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-sm">Quality</Label>
                  <span className="text-sm font-bold text-primary">{quality}%</span>
                </div>
                <Slider value={[quality]} onValueChange={([v]) => setQuality(v)} min={10} max={100} step={5} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-sm">Max Width</Label>
                  <span className="text-sm font-bold text-primary">{maxWidth}px</span>
                </div>
                <Slider value={[maxWidth]} onValueChange={([v]) => setMaxWidth(v)} min={320} max={3840} step={160} />
              </div>
              <div className="flex items-center justify-between text-sm border-t border-white/10 pt-4">
                <span className="text-muted-foreground">Estimated output</span>
                <span className="font-medium">~{formatBytes(estimatedSize)}</span>
              </div>
            </div>
            <ProcessButton onClick={handleProcess} isProcessing={isProcessing} disabled={false} text="Compress Image" color={tool.color} />
          </motion.div>
        )}
      </AnimatePresence>
    </ToolPageLayout>
  );
}
