import { useState, useRef, useCallback } from "react";
import { UploadCloud, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FileDropZoneProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSizeMB?: number;
  title?: string;
  description?: string;
}

export function FileDropZone({ onFileSelect, accept = "*/*", maxSizeMB = 50, title = "Drop your file here", description = "or click to browse" }: FileDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (file.size > maxSizeMB * 1024 * 1024) { setError(`File size must be less than ${maxSizeMB}MB`); return; }
    setError(null);
    onFileSelect(file);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); }, []);
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) processFile(e.dataTransfer.files[0]);
  }, []);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) processFile(e.target.files[0]);
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
        className={`w-full max-w-2xl aspect-video rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-8 text-center cursor-pointer transition-all duration-300 glass ${isDragging ? "border-primary bg-primary/10" : "border-border/50 hover:border-primary/50 hover:bg-primary/5"}`}
      >
        <input type="file" ref={inputRef} className="hidden" accept={accept} onChange={handleChange} />
        <motion.div animate={isDragging ? { scale: 1.1, y: -10 } : { scale: 1, y: 0 }} className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
          <UploadCloud className="w-8 h-8" />
        </motion.div>
        <h3 className="text-xl font-medium mb-2">{title}</h3>
        <p className="text-muted-foreground mb-4">{description}</p>
        <AnimatePresence>
          {error && (
            <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="text-destructive text-sm">
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
      <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground/80 font-medium tracking-wide uppercase px-3 py-1.5 rounded-full border border-border/40 glass">
        <ShieldCheck className="w-4 h-4 text-primary" />
        Your files never leave your device
      </div>
    </div>
  );
}
