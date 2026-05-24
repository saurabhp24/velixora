import { useState, useEffect, useCallback } from "react";
import { useFileContext } from "../../contexts/FileContext";
import { getToolByHref } from "../../lib/tools";
import { ToolPageLayout } from "../../components/tools/ToolPageLayout";
import { ProcessButton } from "../../components/tools/ProcessButton";
import { DownloadResult } from "../../components/tools/DownloadResult";
import { saveAs } from "file-saver";
import { useToast } from "../../hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { X, FileText, FileImage, Archive, FileCode, Music, Video, File, Plus } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getFileIcon(name: string) {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (["pdf"].includes(ext)) return { Icon: FileText, color: "#ef4444" };
  if (["jpg", "jpeg", "png", "webp", "gif", "svg"].includes(ext)) return { Icon: FileImage, color: "#06b6d4" };
  if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) return { Icon: Archive, color: "#f59e0b" };
  if (["js", "ts", "tsx", "jsx", "py", "rb", "go", "rs", "json", "html", "css"].includes(ext)) return { Icon: FileCode, color: "#10b981" };
  if (["mp3", "wav", "ogg", "flac"].includes(ext)) return { Icon: Music, color: "#8b5cf6" };
  if (["mp4", "mov", "avi", "webm"].includes(ext)) return { Icon: Video, color: "#f97316" };
  if (["doc", "docx", "txt", "rtf"].includes(ext)) return { Icon: FileText, color: "#3b82f6" };
  return { Icon: File, color: "#6b7280" };
}

export default function ZipFiles() {
  const tool = getToolByHref("/tools/zip-files")!;
  const { pendingFiles, clearPendingFiles } = useFileContext();
  const [files, setFiles] = useState<File[]>([]);
  const [archiveName, setArchiveName] = useState("archive");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; name: string } | null>(null);
  const { toast } = useToast();

  const addFiles = useCallback((newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  useEffect(() => {
    if (pendingFiles.length > 0) { addFiles(pendingFiles); clearPendingFiles(); }
  }, [pendingFiles, clearPendingFiles, addFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop: addFiles });

  const totalSize = files.reduce((sum, f) => sum + f.size, 0);

  const handleProcess = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      files.forEach((f) => zip.file(f.name, f));
      const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } });
      const name = `${archiveName.trim() || "archive"}.zip`;
      setResult({ blob, name });
      toast({ title: "Done!", description: `${files.length} files zipped.` });
    } catch {
      toast({ title: "Error", description: "Failed to create ZIP.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => { setFiles([]); setResult(null); };

  return (
    <ToolPageLayout tool={tool}>
      <AnimatePresence mode="wait">
        {result ? (
          <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <DownloadResult onDownload={() => saveAs(result.blob, result.name)} onReset={handleReset} filename={result.name} size={result.blob.size} />
          </motion.div>
        ) : (
          <motion.div key="editor" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            {/* Drop zone */}
            <div {...getRootProps()} className={`rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-300 ${isDragActive ? "border-primary bg-primary/5" : "border-white/15 hover:border-primary/40 bg-white/3"}`}>
              <input {...getInputProps()} data-testid="zip-upload-input" />
              <div className="flex flex-col items-center gap-2 text-white/40">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Plus className="w-5 h-5 text-amber-400" />
                </div>
                <p className="text-sm">{isDragActive ? "Drop files here" : "Drop any files here or click to browse — all formats accepted"}</p>
              </div>
            </div>

            {/* File list */}
            {files.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <p className="text-xs text-muted-foreground">{files.length} file{files.length !== 1 ? "s" : ""} • {formatBytes(totalSize)} total</p>
                  <button onClick={() => setFiles([])} className="text-xs text-muted-foreground hover:text-foreground transition-colors" data-testid="clear-all-btn">Clear all</button>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/3 divide-y divide-white/5 overflow-hidden" data-testid="file-list">
                  <AnimatePresence initial={false}>
                    {files.map((f, idx) => {
                      const { Icon, color } = getFileIcon(f.name);
                      return (
                        <motion.div
                          key={`${f.name}-${idx}`}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex items-center gap-3 px-4 py-3"
                        >
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}15`, color }}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-foreground/80 truncate">{f.name}</p>
                            <p className="text-xs text-muted-foreground">{formatBytes(f.size)}</p>
                          </div>
                          <button onClick={() => setFiles((prev) => prev.filter((_, i) => i !== idx))} className="p-1 rounded-lg hover:bg-white/10 text-white/30 hover:text-white/70 transition-colors flex-shrink-0" data-testid={`remove-file-${idx}`}>
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>

                {/* Archive name */}
                <div className="space-y-1.5">
                  <Label className="text-sm">Archive name</Label>
                  <div className="flex items-center gap-2">
                    <Input value={archiveName} onChange={(e) => setArchiveName(e.target.value)} className="bg-background/50 flex-1" placeholder="archive" data-testid="archive-name-input" />
                    <span className="text-sm text-muted-foreground flex-shrink-0">.zip</span>
                  </div>
                </div>

                <ProcessButton onClick={handleProcess} isProcessing={isProcessing} disabled={false} text={`Create ZIP (${formatBytes(totalSize)})`} color={tool.color} />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </ToolPageLayout>
  );
}
