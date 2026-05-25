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
import { Link2, Link2Off } from "lucide-react";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

export default function ResizeImage() {
  const tool = getToolByHref("/tools/resize-image")!;
  const { pendingFiles, clearPendingFiles } = useFileContext();
  const [file, setFile] = useState<File | null>(null);
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [lockAspect, setLockAspect] = useState(true);
  const [naturalDims, setNaturalDims] = useState<{ w: number; h: number } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; name: string } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (pendingFiles.length > 0) { setFile(pendingFiles[0]); clearPendingFiles(); }
  }, [pendingFiles, clearPendingFiles]);

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { setNaturalDims({ w: img.naturalWidth, h: img.naturalHeight }); setWidth(String(img.naturalWidth)); setHeight(String(img.naturalHeight)); URL.revokeObjectURL(url); };
    img.src = url;
  }, [file]);

  const handleWidthChange = (val: string) => {
    setWidth(val);
    if (lockAspect && naturalDims && val) {
      const w = parseInt(val);
      if (!isNaN(w)) setHeight(String(Math.round(w * naturalDims.h / naturalDims.w)));
    }
  };

  const handleHeightChange = (val: string) => {
    setHeight(val);
    if (lockAspect && naturalDims && val) {
      const h = parseInt(val);
      if (!isNaN(h)) setWidth(String(Math.round(h * naturalDims.w / naturalDims.h)));
    }
  };

  const handleFilesAccepted = (f: File[]) => { setFile(f[0]); setResult(null); };
  const handleReset = () => { setFile(null); setResult(null); setNaturalDims(null); setWidth(""); setHeight(""); };

  const handleProcess = async () => {
    if (!file) return;
    const tw = parseInt(width), th = parseInt(height);
    if (isNaN(tw) || isNaN(th) || tw <= 0 || th <= 0) {
      toast({ title: "Error", description: "Enter valid dimensions.", variant: "destructive" }); return;
    }
    setIsProcessing(true);
    try {
      const url = URL.createObjectURL(file);
      const img = await new Promise<HTMLImageElement>((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; });
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      canvas.width = tw; canvas.height = th;
      canvas.getContext("2d")!.drawImage(img, 0, 0, tw, th);
      const blob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), file.type, 0.92));
      setResult({ blob, name: `resized-${tw}x${th}-${file.name}` });
      toast({ title: "Done!", description: `Resized to ${tw}×${th}px.` });
    } catch {
      toast({ title: "Error", description: "Failed to resize image.", variant: "destructive" });
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
          <motion.div key="editor" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
            <ImagePreviewCard file={file} onRemove={handleReset} />
            <div className="p-5 rounded-xl border border-white/10 bg-white/5 space-y-4">
              <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-end">
                <div className="space-y-1.5">
                  <Label className="text-sm">Width (px)</Label>
                  <Input type="number" value={width} onChange={(e) => handleWidthChange(e.target.value)} className="bg-background/50" min="1" />
                </div>
                <button onClick={() => setLockAspect(!lockAspect)} className="mb-1 p-2 rounded-lg hover:bg-white/10 transition-colors" title={lockAspect ? "Unlock aspect ratio" : "Lock aspect ratio"}>
                  {lockAspect ? <Link2 className="w-4 h-4 text-primary" /> : <Link2Off className="w-4 h-4 text-white/30" />}
                </button>
                <div className="space-y-1.5">
                  <Label className="text-sm">Height (px)</Label>
                  <Input type="number" value={height} onChange={(e) => handleHeightChange(e.target.value)} className="bg-background/50" min="1" />
                </div>
              </div>
              {naturalDims && <p className="text-xs text-muted-foreground">Original: {naturalDims.w} × {naturalDims.h}px</p>}
            </div>
            <ProcessButton onClick={handleProcess} isProcessing={isProcessing} disabled={!width || !height} text="Resize Image" color={tool.color} />
          </motion.div>
        )}
      </AnimatePresence>
    </ToolPageLayout>
  );
}
