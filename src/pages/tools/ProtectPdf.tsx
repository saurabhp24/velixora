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
import { Eye, EyeOff, ShieldCheck, Shield } from "lucide-react";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { cn } from "../../lib/utils";

function getStrength(pw: string): { score: number; label: string; color: string } {
  if (!pw) return { score: 0, label: "", color: "transparent" };
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  if (s <= 1) return { score: s, label: "Weak", color: "#ef4444" };
  if (s <= 3) return { score: s, label: "Fair", color: "#f59e0b" };
  return { score: s, label: "Strong", color: "#10b981" };
}

export default function ProtectPdf() {
  const tool = getToolByHref("/tools/protect-pdf")!;
  const { pendingFiles, clearPendingFiles } = useFileContext();
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; name: string } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (pendingFiles.length > 0) { setFile(pendingFiles[0]); clearPendingFiles(); }
  }, [pendingFiles, clearPendingFiles]);

  const handleFilesAccepted = (f: File[]) => { setFile(f[0]); setResult(null); };
  const handleReset = () => { setFile(null); setResult(null); setPassword(""); setConfirm(""); };

  const strength = getStrength(password);
  const mismatch = confirm && password !== confirm;

  const handleProcess = async () => {
    if (!file || !password) return;
    if (password !== confirm) {
      toast({ title: "Passwords don't match", description: "Please confirm your password.", variant: "destructive" });
      return;
    }
    setIsProcessing(true);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const ab = await file.arrayBuffer();
      const pdf = await PDFDocument.load(ab);
      const bytes = await pdf.save({ userPassword: password, ownerPassword: password + "_owner" } as any);
      const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
      setResult({ blob, name: file.name.replace(".pdf", "-protected.pdf") });
      toast({ title: "Done!", description: "PDF protected with password." });
    } catch {
      toast({ title: "Error", description: "Failed to protect PDF.", variant: "destructive" });
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
            <div className="p-5 rounded-xl border border-white/10 bg-white/5 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm">Password</Label>
                <div className="relative">
                  <Input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter a strong password..." className="bg-background/50 pr-10" />
                  <button onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {password && (
                  <div className="space-y-1.5">
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300" style={{ backgroundColor: i < strength.score ? strength.color : "rgba(255,255,255,0.1)" }} />
                      ))}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {strength.score >= 4 ? <ShieldCheck className="w-3.5 h-3.5" style={{ color: strength.color }} /> : <Shield className="w-3.5 h-3.5" style={{ color: strength.color }} />}
                      <span className="text-xs font-medium" style={{ color: strength.color }}>{strength.label}</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Confirm password</Label>
                <Input type={showPw ? "text" : "password"} value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Re-enter password..." className={cn("bg-background/50", mismatch ? "border-destructive" : "")} />
                {mismatch && <p className="text-xs text-destructive">Passwords do not match</p>}
              </div>
            </div>
            <ProcessButton onClick={handleProcess} isProcessing={isProcessing} disabled={!password || !confirm || !!mismatch} text="Protect PDF" color={tool.color} />
          </motion.div>
        )}
      </AnimatePresence>
    </ToolPageLayout>
  );
}
