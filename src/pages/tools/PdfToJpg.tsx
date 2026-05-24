import { useState, useEffect } from "react";
import { useFileContext } from "@/contexts/FileContext";
import { getToolByHref } from "@/lib/tools";
import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { UploadZone } from "@/components/tools/UploadZone";
import { ProcessButton } from "@/components/tools/ProcessButton";
import { DownloadResult } from "@/components/tools/DownloadResult";
import { FileInfoCard } from "@/components/tools/FileInfoCard";
import { usePdfThumbnails } from "@/hooks/usePdfThumbnails";
import { zipFiles } from "@/lib/processors/archiveProcessor";
import { saveAs } from "file-saver";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ImageIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function PdfToJpg() {
  const tool = getToolByHref("/tools/pdf-to-jpg")!;
  const { pendingFiles, clearPendingFiles } = useFileContext();
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState<"high" | "medium" | "low">("high");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; name: string } | null>(null);
  const { toast } = useToast();
  const { pages, isRendering } = usePdfThumbnails(file, 2.0);

  useEffect(() => {
    if (pendingFiles.length > 0) { setFile(pendingFiles[0]); clearPendingFiles(); }
  }, [pendingFiles, clearPendingFiles]);

  const handleFilesAccepted = (f: File[]) => { setFile(f[0]); setResult(null); };
  const handleReset = () => { setFile(null); setResult(null); };

  const qualityValue = quality === "high" ? 0.95 : quality === "medium" ? 0.75 : 0.5;
  const renderScale = quality === "high" ? 2.0 : quality === "medium" ? 1.5 : 1.0;

  const handleProcess = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const imageFiles: File[] = [];

      for (let i = 0; i < pdf.numPages; i++) {
        const page = await pdf.getPage(i + 1);
        const viewport = page.getViewport({ scale: renderScale });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d")!;
        await page.render({ canvas, canvasContext: ctx, viewport }).promise;
        const blob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), "image/jpeg", qualityValue));
        imageFiles.push(new File([blob], `page-${i + 1}.jpg`, { type: "image/jpeg" }));
      }

      const zipBlob = await zipFiles(imageFiles);
      setResult({ blob: zipBlob, name: `${file.name.replace(".pdf", "")}-images.zip` });
      toast({ title: "Done!", description: `${imageFiles.length} JPGs packed into ZIP.` });
    } catch {
      toast({ title: "Error", description: "Failed to convert PDF to images.", variant: "destructive" });
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
            <FileInfoCard
              file={file}
              onRemove={handleReset}
              extra={<span className="text-xs text-muted-foreground">{isRendering ? "Rendering previews..." : `${pages.length} pages will become ${pages.length} JPG files`}</span>}
            />

            {/* Quality selector */}
            <div className="p-5 rounded-xl border border-white/10 bg-white/5 space-y-3">
              <Label className="text-sm font-medium">Output Quality</Label>
              <Select value={quality} onValueChange={(v: any) => setQuality(v)}>
                <SelectTrigger className="bg-background/50" data-testid="quality-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High (best quality, larger files)</SelectItem>
                  <SelectItem value="medium">Medium (balanced)</SelectItem>
                  <SelectItem value="low">Low (smallest files)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Page preview grid */}
            <div>
              <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5" />
                Preview of pages that will be converted
              </p>
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
                {pages.map((page, idx) => (
                  <div key={page.index} className="rounded-lg border border-white/10 bg-white/5 overflow-hidden">
                    <div className="aspect-[3/4] flex items-center justify-center">
                      {!page.thumbnail ? <Loader2 className="w-4 h-4 animate-spin text-white/20" /> : (
                        <img src={page.thumbnail} alt={`Page ${idx + 1}`} className="w-full h-full object-contain" draggable={false} />
                      )}
                    </div>
                    <p className="text-[10px] text-center text-white/30 py-1">{idx + 1}</p>
                  </div>
                ))}
              </div>
            </div>

            <ProcessButton onClick={handleProcess} isProcessing={isProcessing} disabled={isRendering || pages.length === 0} text={`Convert ${pages.length} Page${pages.length !== 1 ? "s" : ""} to JPG`} color={tool.color} />
          </motion.div>
        )}
      </AnimatePresence>
    </ToolPageLayout>
  );
}
