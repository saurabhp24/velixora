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
import { Eye, EyeOff, LockOpen, Info } from "lucide-react";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

export default function UnlockPdf() {
  const tool = getToolByHref("/tools/unlock-pdf")!;
  const { pendingFiles, clearPendingFiles } = useFileContext();
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; name: string } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (pendingFiles.length > 0) { setFile(pendingFiles[0]); clearPendingFiles(); }
  }, [pendingFiles, clearPendingFiles]);

  const handleFilesAccepted = (f: File[]) => { setFile(f[0]); setResult(null); setPassword(""); };
  const handleReset = () => { setFile(null); setResult(null); setPassword(""); };

  const handleProcess = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const ab = await file.arrayBuffer();
      const pdf = await PDFDocument.load(ab, { password: password || undefined } as any);
      const bytes = await pdf.save();
      const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
      setResult({ blob, name: file.name.replace(".pdf", "-unlocked.pdf") });
      toast({ title: "Done!", description: "PDF unlocked successfully." });
    } catch {
      toast({ title: "Error", description: "Could not unlock PDF. Check that the password is correct.", variant: "destructive" });
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

            {/* Info */}
            <div className="flex items-start gap-3 px-4 py-3 rounded-xl text-sm text-white/50" style={{ background: "rgba(79,110,247,0.07)", border: "1px solid rgba(79,110,247,0.15)" }}>
              <Info className="w-4 h-4 text-primary/60 flex-shrink-0 mt-0.5" />
              <span>If the PDF is password-protected, enter the password below. If it has no password (just restrictions), leave the field empty and proceed.</span>
            </div>

            <div className="p-5 rounded-xl border border-white/10 bg-white/5 space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <LockOpen className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Enter current password</p>
                  <p className="text-xs text-muted-foreground">Leave empty if the PDF has no password</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm">Password (optional)</Label>
                <div className="relative">
                  <Input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter PDF password..."
                    className="bg-background/50 pr-10"
                    data-testid="unlock-password-input"
                  />
                  <button onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" data-testid="toggle-unlock-pw-btn">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <ProcessButton onClick={handleProcess} isProcessing={isProcessing} disabled={false} text="Unlock PDF" color={tool.color} />
          </motion.div>
        )}
      </AnimatePresence>
    </ToolPageLayout>
  );
}
