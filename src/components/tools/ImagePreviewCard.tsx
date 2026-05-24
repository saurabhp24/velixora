import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

interface ImageDimensions {
  width: number;
  height: number;
}

interface ImagePreviewCardProps {
  file: File;
  onRemove: () => void;
  label?: string;
  overlay?: React.ReactNode;
  className?: string;
}

export function ImagePreviewCard({
  file,
  onRemove,
  label,
  overlay,
  className,
}: ImagePreviewCardProps) {
  const [src, setSrc] = useState<string | null>(null);
  const [dims, setDims] = useState<ImageDimensions | null>(null);
  const ext = file.name.split(".").pop()?.toUpperCase() ?? "IMG";

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setSrc(url);
    const img = new Image();
    img.onload = () => setDims({ width: img.naturalWidth, height: img.naturalHeight });
    img.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        "relative rounded-2xl border border-white/10 bg-white/5 overflow-hidden",
        className
      )}
    >
      {/* Image area */}
      <div className="relative aspect-video w-full bg-black/20 flex items-center justify-center overflow-hidden">
        {src ? (
          <img
            src={src}
            alt={file.name}
            className="max-w-full max-h-full object-contain"
            draggable={false}
          />
        ) : (
          <div className="w-8 h-8 rounded-full border-2 border-cyan-500/40 border-t-cyan-500 animate-spin" />
        )}
        {overlay && (
          <div className="absolute inset-0 flex items-center justify-center">
            {overlay}
          </div>
        )}
      </div>

      {/* Metadata bar */}
      <div className="flex items-center justify-between px-4 py-3 gap-3">
        <div className="flex-1 min-w-0">
          {label && <p className="text-xs text-muted-foreground mb-0.5">{label}</p>}
          <p className="text-sm font-medium text-foreground/80 truncate">{file.name}</p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-400">
              {ext}
            </span>
            <span className="text-xs text-muted-foreground">{formatBytes(file.size)}</span>
            {dims && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Maximize2 className="w-3 h-3" />
                {dims.width} × {dims.height}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={onRemove}
          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground flex-shrink-0"
          data-testid="remove-image-btn"
          title="Remove image"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
