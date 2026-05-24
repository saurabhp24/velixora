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
import { cn } from "@/lib/utils";

type Format = "image/png" | "image/jpeg" | "image/webp";

const FORMATS: { value: Format; label: string; ext: string; desc: string }[] = [
  { value: "image/png", label: "PNG", ext: "png", desc: "Lossless, transparency" },
  { value: "image/jpeg", label: "JPEG", ext: "jpg", desc: "Lossy, smaller files" },
  { value: "image/webp", label: "WEBP", ext: "webp", desc: "Modern, best balance" },
];

export default function ConvertImage() {
  const tool = getToolByHref("/tools/convert-image")!;
  const { pendingFiles, clearPendingFiles } = useFileContext();
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<Format>("image/webp");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; name: string } | null>(null);
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
      const url = URL.createObjectURL(file);
      const img = await new Promise<HTMLImageElement>((res, rej) => {
        const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url;
      });
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      if (format === "image/jpeg") { ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, canvas.width, canvas.height); }
      ctx.drawImage(img, 0, 0);
      const blob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), format, 0.92));
      const ext = FORMATS.find((f) => f.value === format)!.ext;
      const base = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
      setResult({ blob, name: `${base}.${ext}` });
      toast({ title: "Done!", description: `Converted to ${ext.toUpperCase()}.` });
    } catch {
      toast({ title: "Error", description: "Failed to convert image.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const currentExt = file?.name.split(".").pop()?.toUpperCase() ?? "";

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
          <motion.div key="editor" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
            <ImagePreviewCard file={file} onRemove={handleReset} label="Source image" />

            {/* Format selector */}
            <div className="p-5 rounded-xl border border-white/10 bg-white/5 space-y-3">
              <p className="text-sm font-medium text-foreground/80">Convert to</p>
              <div className="grid grid-cols-3 gap-3">
                {FORMATS.map((f) => {
                  const isCurrent = currentExt === f.label;
                  const isSelected = format === f.value;
                  return (
                    <button
                      key={f.value}
                      onClick={() => setFormat(f.value)}
                      disabled={isCurrent}
                      className={cn(
                        "relative flex flex-col items-center gap-1.5 p-4 rounded-xl border-2 transition-all duration-200",
                        isSelected ? "border-primary bg-primary/10 text-primary" : "border-white/10 bg-white/3 text-white/50 hover:border-white/25 hover:text-white/80",
                        isCurrent ? "opacity-40 cursor-not-allowed" : "cursor-pointer"
                      )}
                      data-testid={`format-${f.ext}`}
                    >
                      {isCurrent && (
                        <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] bg-white/15 text-white/50 px-1.5 py-0.5 rounded-full">current</span>
                      )}
                      <span className="text-xl font-black">{f.label}</span>
                      <span className="text-[10px] text-center leading-tight opacity-70">{f.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <ProcessButton
              onClick={handleProcess}
              isProcessing={isProcessing}
              disabled={false}
              text={`Convert to ${FORMATS.find((f) => f.value === format)!.label}`}
              color={tool.color}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </ToolPageLayout>
  );
}
