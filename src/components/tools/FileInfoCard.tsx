import { motion } from "framer-motion";
import { X, FileText, FileImage, Archive, File } from "lucide-react";
import { cn } from "../../lib/utils";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getFileIcon(file: File) {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (["pdf"].includes(ext)) return FileText;
  if (["jpg", "jpeg", "png", "webp", "gif", "bmp"].includes(ext)) return FileImage;
  if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) return Archive;
  if (["doc", "docx"].includes(ext)) return FileText;
  return File;
}

function getFileColor(file: File): string {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "pdf") return "#ef4444";
  if (["jpg", "jpeg", "png", "webp"].includes(ext)) return "#06b6d4";
  if (["zip", "rar", "7z"].includes(ext)) return "#f59e0b";
  if (["doc", "docx"].includes(ext)) return "#3b82f6";
  return "#8b5cf6";
}

interface FileInfoCardProps {
  file: File;
  onRemove: () => void;
  extra?: React.ReactNode;
  className?: string;
}

export function FileInfoCard({ file, onRemove, extra, className }: FileInfoCardProps) {
  const Icon = getFileIcon(file);
  const color = getFileColor(file);
  const ext = file.name.split(".").pop()?.toUpperCase() ?? "FILE";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className={cn(
        "relative flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm",
        className
      )}
      style={{ boxShadow: `0 4px 20px ${color}10` }}
    >
      {/* Color accent bar */}
      <div
        className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full"
        style={{ backgroundColor: color }}
      />

      {/* Icon */}
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ml-2"
        style={{ backgroundColor: `${color}15`, color }}
      >
        <Icon className="w-6 h-6" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground/90 truncate">{file.name}</p>
        <div className="flex items-center gap-2 mt-1">
          <span
            className="text-[10px] font-bold px-1.5 py-0.5 rounded"
            style={{ backgroundColor: `${color}20`, color }}
          >
            {ext}
          </span>
          <span className="text-xs text-muted-foreground">{formatBytes(file.size)}</span>
        </div>
        {extra && <div className="mt-1">{extra}</div>}
      </div>

      {/* Remove */}
      <button
        onClick={onRemove}
        className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground flex-shrink-0"
        data-testid="remove-file-btn"
        title="Remove file"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}
