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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";

type Position = "center" | "top-left" | "top-right" | "bottom-left" | "bottom-right";

const POSITIONS: { value: Position; label: string }[] = [
  { value: "top-left", label: "Top Left" },
  { value: "top-right", label: "Top Right" },
  { value: "center", label: "Center" },
  { value: "bottom-left", label: "Bottom Left" },
  { value: "bottom-right", label: "Bottom Right" },
];

export default function WatermarkPdf() {
  const tool = getToolByHref("/tools/watermark-pdf")!;
  const { pendingFiles, clearPendingFiles } = useFileContext();
  const [file, setFile] = useState<File | null>(null);
  const [watermark, setWatermark] = useState("CONFIDENTIAL");
  const [opacity, setOpacity] = useState(30);
  const [position, setPosition] = useState<Position>("center");
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
      const { PDFDocument, rgb, degrees, StandardFonts } = await import("pdf-lib");
      const ab = await file.arrayBuffer();
      const pdf = await PDFDocument.load(ab);
      const font = await pdf.embedFont(StandardFonts.HelveticaBold);
      const text = watermark || "WATERMARK";
      const fontSize = 48;
      const op = opacity / 100;

      for (const page of pdf.getPages()) {
        const { width, height } = page.getSize();
        const tw = font.widthOfTextAtSize(text, fontSize);
        let x: number, y: number;
        const margin = 40;
        switch (position) {
          case "top-left": x = margin; y = height - margin - fontSize; break;
          case "top-right": x = width - tw - margin; y = height - margin - fontSize; break;
          case "bottom-left": x = margin; y = margin; break;
          case "bottom-right": x = width - tw - margin; y = margin; break;
          default: x = (width - tw) / 2; y = (height - fontSize) / 2;
        }
        page.drawText(text, {
          x, y, size: fontSize, font,
          color: rgb(0.6, 0.6, 0.6),
          opacity: op,
          rotate: position === "center" ? degrees(45) : degrees(0),
        });
      }

      const bytes = await pdf.save();
      const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
      setResult({ blob, name: file.name.replace(".pdf", "-watermarked.pdf") });
      toast({ title: "Done!", description: "Watermark added to all pages." });
    } catch {
      toast({ title: "Error", description: "Failed to add watermark.", variant: "destructive" });
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

            {/* Watermark preview */}
            <div className="relative rounded-xl border border-white/10 bg-white/3 overflow-hidden" style={{ height: 120 }}>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-full bg-white/5 rounded-xl" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span
                  className="text-4xl font-black tracking-widest select-none pointer-events-none"
                  style={{
                    opacity: opacity / 100,
                    color: "#999",
                    transform: position === "center" ? "rotate(45deg)" : "none",
                    position: "absolute",
                    ...(position === "center" ? { top: "50%", left: "50%", transform: "translate(-50%, -50%) rotate(45deg)" } : {}),
                    ...(position === "top-left" ? { top: 16, left: 16 } : {}),
                    ...(position === "top-right" ? { top: 16, right: 16 } : {}),
                    ...(position === "bottom-left" ? { bottom: 16, left: 16 } : {}),
                    ...(position === "bottom-right" ? { bottom: 16, right: 16 } : {}),
                  }}
                >
                  {watermark || "WATERMARK"}
                </span>
              </div>
              <div className="absolute bottom-2 right-3 text-xs text-white/20">Preview</div>
            </div>

            <div className="p-5 rounded-xl border border-white/10 bg-white/5 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm">Watermark text</Label>
                <Input value={watermark} onChange={(e) => setWatermark(e.target.value)} className="bg-background/50" placeholder="CONFIDENTIAL" data-testid="watermark-text-input" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-sm">Opacity</Label>
                  <span className="text-sm font-bold text-primary">{opacity}%</span>
                </div>
                <Slider value={[opacity]} onValueChange={([v]) => setOpacity(v)} min={5} max={80} step={5} data-testid="opacity-slider" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm">Position</Label>
                <Select value={position} onValueChange={(v: Position) => setPosition(v)}>
                  <SelectTrigger className="bg-background/50" data-testid="position-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {POSITIONS.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <ProcessButton onClick={handleProcess} isProcessing={isProcessing} disabled={!watermark} text="Add Watermark" color={tool.color} />
          </motion.div>
        )}
      </AnimatePresence>
    </ToolPageLayout>
  );
}
