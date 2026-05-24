import { useState, useEffect } from "react";
import { useFileContext } from "@/contexts/FileContext";
import { getToolByHref } from "@/lib/tools";
import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { UploadZone } from "@/components/tools/UploadZone";
import { ProcessButton } from "@/components/tools/ProcessButton";
import { DownloadResult } from "@/components/tools/DownloadResult";
import { ImagePreviewCard } from "@/components/tools/ImagePreviewCard";
import { saveAs } from "file-saver";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingDown } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

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
        maxSizeMB: (file.size / (1024 * 1024)) * (quality / 100),
        maxWidthOrHeight: maxWidth,
        useWebWorker: true,
        fileType: file.type as any,
        initialQuality: quality / 100,
      });
      const savings = ((1 - compressed.size / file.size) * 100);
      setResult({ blob: compressed, name: `compressed-${file.name}`, savings });
      toast({ title: "Done!", description: `Reduced by ${savings.toFixed(1)}%` });
    } catch {
      toast({ title: "Error", description: "Failed to compress image.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolPageLayout tool={tool}>
      <AnimatePresence mode="wait">
        {result ? (
          <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
            {/* Before/after stats */}
            <div className="grid grid-cols-3 gap-3 p-5 rounded-xl border border-white/10 bg-white/5">
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Original</p>
                <p className="text-lg font-bold text-foreground">{formatBytes(file!.size)}</p>
              </div>
              <div className="text-center flex flex-col items-center justify-center">
                <TrendingDown className="w-5 h-5 text-emerald-400 mb-1" />
                <p className="text-lg font-bold text-emerald-400">-{result.savings.toFixed(1)}%</p>
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
            <ImagePreviewCard file={file} onRemove={handleReset} label="Original image" />

            {/* Settings */}
            <div className="p-5 rounded-xl border border-white/10 bg-white/5 space-y-5">
              {/* Quality */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-medium">Quality</Label>
                  <span className="text-sm font-bold text-primary">{quality}%</span>
                </div>
                <Slider
                  value={[quality]}
                  onValueChange={([v]) => setQuality(v)}
                  min={10} max={100} step={5}
                  data-testid="quality-slider"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Smaller file</span>
                  <span>Best quality</span>
                </div>
              </div>

              {/* Max width */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-medium">Max width</Label>
                  <span className="text-sm font-bold text-primary">{maxWidth}px</span>
                </div>
                <Slider
                  value={[maxWidth]}
                  onValueChange={([v]) => setMaxWidth(v)}
                  min={320} max={4096} step={64}
                  data-testid="maxwidth-slider"
                />
              </div>

              {/* Estimate */}
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-white/10">
                <span>Original size</span>
                <span className="font-medium text-foreground/60">{formatBytes(file.size)}</span>
              </div>
            </div>

            <ProcessButton onClick={handleProcess} isProcessing={isProcessing} disabled={false} text="Compress Image" color={tool.color} />
          </motion.div>
        )}
      </AnimatePresence>
    </ToolPageLayout>
  );
}
