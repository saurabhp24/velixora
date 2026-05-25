import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileType, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";
import { ToolDefinition } from "../../lib/tools";
import { useFileContext } from "../../contexts/FileContext";

interface UploadZoneProps {
  tool?: ToolDefinition;
  onFilesAccepted: (files: File[]) => void;
  maxFiles?: number;
  accept?: Record<string, string[]>;
  isProcessing?: boolean;
  className?: string;
}

export function UploadZone({ 
  tool, 
  onFilesAccepted, 
  maxFiles = 0, // 0 means unlimited if multiple is true, but react-dropzone uses 0 for unlimited.
  accept, 
  isProcessing = false,
  className 
}: UploadZoneProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const multiple = tool?.multiple ?? (maxFiles !== 1);
  const acceptedTypes = accept || (tool?.accept ? { [tool.accept]: [] } : undefined);

  const { incrementFilesProcessed, recordToolUsage } = useFileContext();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      incrementFilesProcessed(acceptedFiles.length);
      if (tool?.id) {
        recordToolUsage(tool.id, acceptedFiles.length);
      }
      onFilesAccepted(acceptedFiles);
    }
  }, [onFilesAccepted, incrementFilesProcessed, recordToolUsage, tool?.id]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    multiple,
    accept: acceptedTypes,
    maxFiles: maxFiles > 0 ? maxFiles : undefined
  });

  return (
    <div 
      {...getRootProps()} 
      className={cn(
        "relative w-full rounded-2xl border-2 border-dashed transition-all duration-500 ease-out cursor-pointer overflow-hidden group",
        isDragActive ? "border-primary bg-primary/5" : "border-border/50 hover:border-primary/50 glass-panel hover:bg-white/5",
        isDragReject ? "border-destructive bg-destructive/5" : "",
        isProcessing ? "opacity-50 pointer-events-none" : "",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <input {...getInputProps()} data-testid="upload-input" />
      
      {/* Background glow effects */}
      <div 
        className={cn(
          "absolute inset-0 opacity-0 transition-opacity duration-500 pointer-events-none blur-3xl",
          isDragActive || isHovered ? "opacity-20" : ""
        )}
        style={{ backgroundColor: tool?.color || 'var(--primary)' }}
      />

      <div className="relative z-10 flex flex-col items-center justify-center py-20 px-6 text-center h-full min-h-[300px]">
        <AnimatePresence mode="wait">
          {isProcessing ? (
            <motion.div
              key="processing"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="flex flex-col items-center"
            >
              <Loader2 className="w-16 h-16 text-primary animate-spin mb-4" />
              <p className="text-lg font-medium text-foreground">Processing Files...</p>
            </motion.div>
          ) : isDragActive ? (
            <motion.div
              key="active"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="flex flex-col items-center text-primary"
            >
              <CheckCircle2 className="w-16 h-16 mb-4 drop-shadow-[0_0_15px_rgba(79,110,247,0.5)]" />
              <p className="text-xl font-bold">Drop files here!</p>
            </motion.div>
          ) : isDragReject ? (
            <motion.div
              key="reject"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="flex flex-col items-center text-destructive"
            >
              <FileType className="w-16 h-16 mb-4" />
              <p className="text-xl font-bold">Unsupported file type</p>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="flex flex-col items-center"
            >
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110"
                style={{ 
                  backgroundColor: `${tool?.color || '#4F6EF7'}15`,
                  color: tool?.color || '#4F6EF7',
                  boxShadow: isHovered ? `0 0 30px ${tool?.color || '#4F6EF7'}30` : 'none'
                }}
              >
                {tool ? <tool.icon className="w-10 h-10" /> : <Upload className="w-10 h-10" />}
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">
                {multiple ? "Choose files" : "Choose a file"}
                <span className="text-muted-foreground font-normal"> or drag it here</span>
              </h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-md">
                {tool ? `Upload your ${tool.accept.split(',').map(a => a.split('/')[1] || a).join(', ')} files to begin processing. Everything happens securely in your browser.` : "Upload your files to begin processing."}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
