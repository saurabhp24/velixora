import { useState, useEffect } from "react";
import { useFileContext } from "@/contexts/FileContext";
import { getToolByHref } from "@/lib/tools";
import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { UploadZone } from "@/components/tools/UploadZone";
import { ProcessButton } from "@/components/tools/ProcessButton";
import { DownloadResult } from "@/components/tools/DownloadResult";
import { FileInfoCard } from "@/components/tools/FileInfoCard";
import { usePdfThumbnails } from "@/hooks/usePdfThumbnails";
import { saveAs } from "file-saver";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { AlignLeft, Loader2 } from "lucide-react";

export default function PdfToWord() {
  const tool = getToolByHref("/tools/pdf-to-word")!;
  const { pendingFiles, clearPendingFiles } = useFileContext();
  const [file, setFile] = useState<File | null>(null);
  const [textPreview, setTextPreview] = useState<string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; name: string } | null>(null);
  const { toast } = useToast();
  const { pages, isRendering } = usePdfThumbnails(file, 0.8);

  useEffect(() => {
    if (pendingFiles.length > 0) { setFile(pendingFiles[0]); clearPendingFiles(); }
  }, [pendingFiles, clearPendingFiles]);

  // Extract text preview
  useEffect(() => {
    if (!file) { setTextPreview(null); return; }
    setIsLoadingPreview(true);
    (async () => {
      try {
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
        const ab = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: ab }).promise;
        let text = "";
        const pagesToScan = Math.min(pdf.numPages, 3);
        for (let i = 1; i <= pagesToScan; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map((item: any) => item.str).join(" ") + "\n\n";
        }
        setTextPreview(text.slice(0, 500) + (text.length > 500 ? "..." : ""));
      } catch {
        setTextPreview("Could not extract text preview.");
      } finally {
        setIsLoadingPreview(false);
      }
    })();
  }, [file]);

  const handleFilesAccepted = (f: File[]) => { setFile(f[0]); setResult(null); setTextPreview(null); };
  const handleReset = () => { setFile(null); setResult(null); setTextPreview(null); };

  const handleProcess = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
      const ab = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: ab }).promise;
      let fullText = `Document extracted from: ${file.name}\n${"=".repeat(50)}\n\n`;
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        fullText += `--- Page ${i} ---\n`;
        fullText += content.items.map((item: any) => item.str).join(" ") + "\n\n";
      }
      const blob = new Blob([fullText], { type: "text/plain;charset=utf-8" });
      setResult({ blob, name: file.name.replace(".pdf", "-extracted.txt") });
      toast({ title: "Done!", description: `Text extracted from ${pdf.numPages} pages.` });
    } catch {
      toast({ title: "Error", description: "Failed to extract text from PDF.", variant: "destructive" });
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
              extra={<span className="text-xs text-muted-foreground">{isRendering ? "Loading..." : `${pages.length} pages`}</span>}
            />

            {/* Page thumbnails strip */}
            {pages.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {pages.slice(0, 8).map((page, idx) => (
                  <div key={idx} className="flex-shrink-0 w-16 rounded-lg border border-white/10 bg-white/5 overflow-hidden">
                    <div className="aspect-[3/4] flex items-center justify-center">
                      {!page.thumbnail ? <Loader2 className="w-4 h-4 animate-spin text-white/20" /> : (
                        <img src={page.thumbnail} alt={`p${idx + 1}`} className="w-full h-full object-contain" draggable={false} />
                      )}
                    </div>
                    <p className="text-[10px] text-center text-white/30 py-1">{idx + 1}</p>
                  </div>
                ))}
                {pages.length > 8 && (
                  <div className="flex-shrink-0 w-16 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center text-white/30">
                    <span className="text-xs">+{pages.length - 8}</span>
                  </div>
                )}
              </div>
            )}

            {/* Text preview */}
            <div className="p-5 rounded-xl border border-white/10 bg-white/5 space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground/70">
                <AlignLeft className="w-4 h-4" />
                <span>Text preview (first 3 pages)</span>
              </div>
              {isLoadingPreview ? (
                <div className="flex items-center gap-2 text-muted-foreground py-3">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Extracting text...</span>
                </div>
              ) : textPreview ? (
                <div className="bg-black/20 rounded-lg p-4 max-h-40 overflow-y-auto">
                  <p className="text-sm text-foreground/50 leading-relaxed whitespace-pre-wrap">{textPreview}</p>
                </div>
              ) : null}
            </div>

            <ProcessButton onClick={handleProcess} isProcessing={isProcessing} disabled={isLoadingPreview} text="Extract Text" color={tool.color} />
          </motion.div>
        )}
      </AnimatePresence>
    </ToolPageLayout>
  );
}
