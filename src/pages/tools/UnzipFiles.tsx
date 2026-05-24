import { useState, useEffect } from "react";
import { useFileContext } from "../../contexts/FileContext";
import { getToolByHref } from "../../lib/tools";
import { ToolPageLayout } from "../../components/tools/ToolPageLayout";
import { UploadZone } from "../../components/tools/UploadZone";
import { ProcessButton } from "../../components/tools/ProcessButton";
import { FileInfoCard } from "../../components/tools/FileInfoCard";
import { saveAs } from "file-saver";
import { useToast } from "../../hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Package, FileText, FileImage, Archive, File, FileCode, ChevronDown } from "lucide-react";
import { Button } from "../../components/ui/button";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getFileIcon(name: string): { Icon: any; color: string } {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "pdf") return { Icon: FileText, color: "#ef4444" };
  if (["jpg", "jpeg", "png", "webp", "gif"].includes(ext)) return { Icon: FileImage, color: "#06b6d4" };
  if (["zip", "rar", "7z"].includes(ext)) return { Icon: Archive, color: "#f59e0b" };
  if (["js", "ts", "py", "json", "html", "css"].includes(ext)) return { Icon: FileCode, color: "#10b981" };
  if (["doc", "docx", "txt"].includes(ext)) return { Icon: FileText, color: "#3b82f6" };
  return { Icon: File, color: "#6b7280" };
}

interface ZipEntry {
  name: string;
  size: number;
  compressedSize: number;
  isDirectory: boolean;
}

export default function UnzipFiles() {
  const tool = getToolByHref("/tools/unzip-files")!;
  const { pendingFiles, clearPendingFiles } = useFileContext();
  const [file, setFile] = useState<File | null>(null);
  const [entries, setEntries] = useState<ZipEntry[]>([]);
  const [extractedFiles, setExtractedFiles] = useState<{ name: string; blob: Blob }[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (pendingFiles.length > 0) { setFile(pendingFiles[0]); clearPendingFiles(); }
  }, [pendingFiles, clearPendingFiles]);

  // Scan ZIP contents on file selection
  useEffect(() => {
    if (!file) { setEntries([]); return; }
    setIsScanning(true);
    (async () => {
      try {
        const JSZip = (await import("jszip")).default;
        const zip = await JSZip.loadAsync(file);
        const list: ZipEntry[] = [];
        zip.forEach((path, entry) => {
          list.push({ name: path, size: 0, compressedSize: 0, isDirectory: entry.dir });
        });
        setEntries(list.filter((e) => !e.isDirectory));
      } catch {
        toast({ title: "Error", description: "Cannot read this ZIP file.", variant: "destructive" });
        setFile(null);
      } finally {
        setIsScanning(false);
      }
    })();
  }, [file, toast]);

  const handleFilesAccepted = (f: File[]) => { setFile(f[0]); setExtractedFiles([]); };
  const handleReset = () => { setFile(null); setEntries([]); setExtractedFiles([]); };

  const handleExtract = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const JSZip = (await import("jszip")).default;
      const zip = await JSZip.loadAsync(file);
      const extracted: { name: string; blob: Blob }[] = [];
      for (const [path, entry] of Object.entries(zip.files)) {
        if (!entry.dir) {
          const blob = await entry.async("blob");
          extracted.push({ name: path, blob });
        }
      }
      setExtractedFiles(extracted);
      toast({ title: "Done!", description: `${extracted.length} files extracted.` });
    } catch {
      toast({ title: "Error", description: "Failed to extract files.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadAll = async () => {
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();
    extractedFiles.forEach(({ name, blob }) => zip.file(name, blob));
    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(blob, `extracted-${file?.name ?? "files"}`);
  };

  const visibleEntries = showAll ? entries : entries.slice(0, 12);

  return (
    <ToolPageLayout tool={tool}>
      <AnimatePresence mode="wait">
        {extractedFiles.length > 0 ? (
          <motion.div key="extracted" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-foreground/80">{extractedFiles.length} files extracted</p>
              <Button size="sm" onClick={downloadAll} className="gap-1.5" data-testid="download-all-btn">
                <Download className="w-3.5 h-3.5" /> Download All
              </Button>
            </div>

            <div className="rounded-xl border border-white/10 divide-y divide-white/5 overflow-hidden max-h-96 overflow-y-auto" data-testid="extracted-list">
              {extractedFiles.map(({ name, blob }, idx) => {
                const { Icon, color } = getFileIcon(name);
                return (
                  <motion.div key={idx} initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: idx * 0.03 } }} className="flex items-center gap-3 px-4 py-3">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}15`, color }}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="flex-1 text-sm text-foreground/70 truncate">{name}</span>
                    <span className="text-xs text-muted-foreground flex-shrink-0">{formatBytes(blob.size)}</span>
                    <Button size="sm" variant="ghost" onClick={() => saveAs(blob, name.split("/").pop() ?? name)} className="flex-shrink-0 h-7 px-2 text-xs" data-testid={`save-file-${idx}`}>
                      <Download className="w-3 h-3" />
                    </Button>
                  </motion.div>
                );
              })}
            </div>

            <Button variant="outline" className="w-full" onClick={handleReset} data-testid="process-another-btn">Extract Another ZIP</Button>
          </motion.div>
        ) : !file ? (
          <motion.div key="upload" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <UploadZone tool={tool} onFilesAccepted={handleFilesAccepted} maxFiles={1} />
          </motion.div>
        ) : (
          <motion.div key="preview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            <FileInfoCard
              file={file}
              onRemove={handleReset}
              extra={isScanning ? <span className="text-xs text-muted-foreground">Scanning contents...</span> : <span className="text-xs text-muted-foreground">{entries.length} files inside</span>}
            />

            {/* Contents preview */}
            {entries.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground px-1">
                  <Package className="w-3.5 h-3.5" />
                  <span>Archive contents</span>
                </div>
                <div className="rounded-xl border border-white/10 divide-y divide-white/5 overflow-hidden">
                  {visibleEntries.map((entry, idx) => {
                    const { Icon, color } = getFileIcon(entry.name);
                    const filename = entry.name.split("/").pop() ?? entry.name;
                    const folder = entry.name.includes("/") ? entry.name.substring(0, entry.name.lastIndexOf("/") + 1) : null;
                    return (
                      <div key={idx} className="flex items-center gap-3 px-4 py-2.5">
                        <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}15`, color }}>
                          <Icon className="w-3 h-3" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-foreground/70 truncate">{filename}</p>
                          {folder && <p className="text-[10px] text-muted-foreground truncate">{folder}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {entries.length > 12 && !showAll && (
                  <button onClick={() => setShowAll(true)} className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1 py-2" data-testid="show-all-btn">
                    <ChevronDown className="w-3 h-3" /> Show all {entries.length} files
                  </button>
                )}
              </div>
            )}

            <ProcessButton onClick={handleExtract} isProcessing={isProcessing} disabled={isScanning || entries.length === 0} text={`Extract ${entries.length} file${entries.length !== 1 ? "s" : ""}`} color={tool.color} />
          </motion.div>
        )}
      </AnimatePresence>
    </ToolPageLayout>
  );
}
