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
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Slider } from "../../components/ui/slider";
import { cn } from "../../lib/utils";

type Position = "bottom-center" | "bottom-left" | "bottom-right" | "top-center" | "top-left" | "top-right";

const POSITION_GRID: { value: Position; label: string; row: number; col: number }[] = [
  { value: "top-left", label: "Top L", row: 0, col: 0 },
  { value: "top-center", label: "Top C", row: 0, col: 1 },
  { value: "top-right", label: "Top R", row: 0, col: 2 },
  { value: "bottom-left", label: "Bot L", row: 1, col: 0 },
  { value: "bottom-center", label: "Bot C", row: 1, col: 1 },
  { value: "bottom-right", label: "Bot R", row: 1, col: 2 },
];

export default function PageNumbers() {
  const tool = getToolByHref("/tools/page-numbers")!;
  const { pendingFiles, clearPendingFiles } = useFileContext();
  const [file, setFile] = useState<File | null>(null);
  const [position, setPosition] = useState<Position>("bottom-center");
  const [startNum, setStartNum] = useState("1");
  const [fontSize, setFontSize] = useState(12);
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
    const start = parseInt(startNum) || 1;
    setIsProcessing(true);
    try {
      const { PDFDocument, rgb, StandardFonts } = await import("pdf-lib");
      const ab = await file.arrayBuffer();
      const pdf = await PDFDocument.load(ab);
      const font = await pdf.embedFont(StandardFonts.Helvetica);
      const margin = 30;

      pdf.getPages().forEach((page, i) => {
        const { width, height } = page.getSize();
        const text = String(start + i);
        const tw = font.widthOfTextAtSize(text, fontSize);
        let x: number, y: number;
        const isTop = position.startsWith("top");
        y = isTop ? height - margin - fontSize : margin;
        if (position.endsWith("left")) x = margin;
        else if (position.endsWith("right")) x = width - tw - margin;
        else x = (width - tw) / 2;
        page.drawText(text, { x, y, size: fontSize, font, color: rgb(0.2, 0.2, 0.2) });
      });

      const bytes = await pdf.save();
      const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
      setResult({ blob, name: file.name.replace(".pdf", "-numbered.pdf") });
      toast({ title: "Done!", description: "Page numbers added." });
    } catch {
      toast({ title: "Error", description: "Failed to add page numbers.", variant: "destructive" });
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

            <div className="p-5 rounded-xl border border-white/10 bg-white/5 space-y-5">
              {/* Position grid */}
              <div className="space-y-2">
                <Label className="text-sm">Number position</Label>
                <div className="grid grid-cols-3 gap-2">
                  {POSITION_GRID.map((pos) => (
                    <button
                      key={pos.value}
                      onClick={() => setPosition(pos.value)}
                      className={cn(
                        "py-2.5 rounded-xl border-2 text-xs font-medium transition-all duration-200",
                        position === pos.value ? "border-primary bg-primary/10 text-primary" : "border-white/10 text-white/40 hover:border-white/25 hover:text-white/70"
                      )}
                      data-testid={`position-${pos.value}`}
                    >
                      {pos.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Start number + font size */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm">Start number</Label>
                  <Input type="number" value={startNum} onChange={(e) => setStartNum(e.target.value)} min="0" className="bg-background/50" data-testid="start-number-input" />
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <Label className="text-sm">Font size</Label>
                    <span className="text-sm font-bold text-primary">{fontSize}pt</span>
                  </div>
                  <Slider value={[fontSize]} onValueChange={([v]) => setFontSize(v)} min={8} max={24} step={1} data-testid="font-size-slider" />
                </div>
              </div>
            </div>

            <ProcessButton onClick={handleProcess} isProcessing={isProcessing} disabled={false} text="Add Page Numbers" color={tool.color} />
          </motion.div>
        )}
      </AnimatePresence>
    </ToolPageLayout>
  );
}
