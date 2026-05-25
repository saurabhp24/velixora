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
import { FileText, Loader2 } from "lucide-react";

export default function WordToPdf() {
  const tool = getToolByHref("/tools/word-to-pdf")!;
  const { pendingFiles, clearPendingFiles } = useFileContext();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; name: string } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (pendingFiles.length > 0) { setFile(pendingFiles[0]); clearPendingFiles(); }
  }, [pendingFiles, clearPendingFiles]);

  useEffect(() => {
    if (!file) { setPreview(null); return; }
    setIsLoadingPreview(true);
    (async () => {
      try {
        const mammoth = await import("mammoth");
        const ab = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer: ab });
        setPreview(result.value.slice(0, 600) + (result.value.length > 600 ? "..." : ""));
      } catch {
        setPreview("Could not load document preview.");
      } finally {
        setIsLoadingPreview(false);
      }
    })();
  }, [file]);

  const handleFilesAccepted = (f: File[]) => { setFile(f[0]); setResult(null); setPreview(null); };
  const handleReset = () => { setFile(null); setResult(null); setPreview(null); };

  const handleProcess = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const mammoth = await import("mammoth");
      const { PDFDocument, rgb, StandardFonts } = await import("pdf-lib");
      const ab = await file.arrayBuffer();
      const { value: text } = await mammoth.extractRawText({ arrayBuffer: ab });

      const pdf = await PDFDocument.create();
      const font = await pdf.embedFont(StandardFonts.Helvetica);
      const fontSize = 11;
      const margin = 50;
      const lineHeight = fontSize * 1.5;

      const words = text.split(/\s+/).filter(Boolean);
      const pageWidth = 595, pageHeight = 842;
      let page = pdf.addPage([pageWidth, pageHeight]);
      let y = pageHeight - margin;
      let line = "";

      const flushLine = (l: string) => {
        if (y < margin + lineHeight) { page = pdf.addPage([pageWidth, pageHeight]); y = pageHeight - margin; }
        page.drawText(l, { x: margin, y, size: fontSize, font, color: rgb(0.1, 0.1, 0.1), maxWidth: pageWidth - margin * 2 });
        y -= lineHeight;
      };

      for (const word of words) {
        const test = line ? `${line} ${word}` : word;
        const w = font.widthOfTextAtSize(test, fontSize);
        if (w > pageWidth - margin * 2) { flushLine(line); line = word; }
        else line = test;
      }
      if (line) flushLine(line);

      const bytes = await pdf.save();
      const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
      setResult({ blob, name: file.name.replace(/\.docx?$/, ".pdf") });
      toast({ title: "Done!", description: "Word document converted to PDF." });
    } catch {
      toast({ title: "Error", description: "Failed to convert document.", variant: "destructive" });
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
            <FileInfoCard file={file} onRemove={handleReset} />
            <div className="p-5 rounded-xl border border-white/10 bg-white/5 space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground/70">
                <FileText className="w-4 h-4" />
                <span>Document preview</span>
              </div>
              {isLoadingPreview ? (
                <div className="flex items-center gap-2 text-muted-foreground py-4">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Loading preview...</span>
                </div>
              ) : preview ? (
                <div className="bg-black/20 rounded-lg p-4 max-h-48 overflow-y-auto">
                  <p className="text-sm text-foreground/60 leading-relaxed whitespace-pre-wrap font-mono">{preview}</p>
                </div>
              ) : null}
            </div>
            <ProcessButton onClick={handleProcess} isProcessing={isProcessing} disabled={isLoadingPreview} text="Convert to PDF" color={tool.color} />
          </motion.div>
        )}
      </AnimatePresence>
    </ToolPageLayout>
  );
}
